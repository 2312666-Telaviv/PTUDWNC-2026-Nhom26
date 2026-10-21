using Asp.Versioning;
using Asp.Versioning.ApiExplorer;
using CulinaryBlog.Application.Services;
using CulinaryBlog.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Scalar.AspNetCore;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Text;
using System.Text.Json;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// API versioning theo URL segment: /api/v1/...
builder.Services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new ApiVersion(1, 0);
    options.AssumeDefaultVersionWhenUnspecified = false;
    options.ReportApiVersions = true;
    options.ApiVersionReader = new UrlSegmentApiVersionReader();
})
.AddMvc()
.AddApiExplorer(options =>
{
    // GroupName dạng "v1" để khớp swagger/v1/swagger.json
    options.GroupNameFormat = "'v'VVV";
    options.SubstituteApiVersionInUrl = true;
});

// Swagger: một tài liệu cho mỗi API version + nút Authorize Bearer
builder.Services.AddSwaggerGen();
builder.Services.ConfigureOptions<ConfigureSwaggerOptions>();

// CORS: chỉ cho phép origin của front-end đọc từ appsettings (không dùng AllowAnyOrigin)
const string CorsPolicyName = "FrontendCors";
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? Array.Empty<string>();

builder.Services.AddCors(options =>
{
    options.AddPolicy(CorsPolicyName, policy =>
    {
        policy.WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials(); // front-end dùng cookie/Auth.js nên cần gửi credentials
    });
});

// Rate Limiting: policy mặc định cho mọi request + policy "auth" chặt hơn cho đăng nhập/đăng ký
var rateLimitSection = builder.Configuration.GetSection("RateLimiting");
var globalPermitLimit = rateLimitSection.GetValue("PermitLimit", 100);
var globalWindowSeconds = rateLimitSection.GetValue("WindowSeconds", 60);
var authPermitLimit = rateLimitSection.GetValue("AuthPermitLimit", 5);
var authWindowSeconds = rateLimitSection.GetValue("AuthWindowSeconds", 10);

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    // Trả về 429 kèm header Retry-After và body ProblemDetails
    options.OnRejected = async (context, cancellationToken) =>
    {
        var httpContext = context.HttpContext;

        // Ưu tiên metadata Retry-After do limiter cung cấp, nếu không có thì dùng cửa sổ của policy
        var retrySeconds = context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter)
            ? (int)Math.Ceiling(retryAfter.TotalSeconds)
            : GetPolicyWindowSeconds(httpContext, authWindowSeconds, globalWindowSeconds);

        httpContext.Response.Headers.RetryAfter = retrySeconds.ToString();

        var problem = new ProblemDetails
        {
            Status = StatusCodes.Status429TooManyRequests,
            Title = "Too Many Requests",
            Detail = $"Bạn đã gửi quá nhiều yêu cầu. Thử lại sau {retrySeconds} giây.",
            Instance = httpContext.Request.Path
        };
        var json = JsonSerializer.Serialize(problem, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        httpContext.Response.ContentType = "application/problem+json";
        await httpContext.Response.WriteAsync(json, cancellationToken);
    };

    // Chính sách chặt cho endpoint xác thực (đăng nhập/đăng ký)
    options.AddPolicy("auth", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = authPermitLimit,
                Window = TimeSpan.FromSeconds(authWindowSeconds),
                QueueLimit = 0
            }));

    // Chính sách mặc định áp cho toàn bộ request
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = globalPermitLimit,
                Window = TimeSpan.FromSeconds(globalWindowSeconds),
                QueueLimit = 0
            }));
});

// Đăng ký ApplicationDbContext kết nối PostgreSQL
builder.Services.AddDbContext<CulinaryBlog.Infrastructure.Persistence.ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Đăng ký ASP.NET Core Identity
builder.Services.AddIdentity<Microsoft.AspNetCore.Identity.IdentityUser, Microsoft.AspNetCore.Identity.IdentityRole>()
    .AddEntityFrameworkStores<CulinaryBlog.Infrastructure.Persistence.ApplicationDbContext>()
    .AddDefaultTokenProviders();

// Cấu hình JWT Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
        ValidAudience = builder.Configuration["JwtSettings:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["JwtSettings:Secret"]!)),
        ClockSkew = TimeSpan.FromMinutes(1)
    };
});

// Phân quyền theo policy cho các endpoint quản trị
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
});

// Đăng ký UnitOfWork
builder.Services.AddScoped<CulinaryBlog.Application.Contracts.IUnitOfWork,
    CulinaryBlog.Infrastructure.Persistence.UnitOfWork>();

// Đăng ký Handler
builder.Services.AddScoped<CulinaryBlog.Application.Features.Recipes.CreateRecipeCommandHandler>();

// Đăng ký TokenService dùng chung cho đăng nhập
builder.Services.AddScoped<ITokenService, TokenService>();

var app = builder.Build();

// Bắt lỗi toàn cục + trả về Problem Details
app.UseMiddleware<CulinaryBlog.API.Middleware.ExceptionHandlingMiddleware>();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

// Swagger chạy ở mọi môi trường để luôn có tài liệu API
app.UseSwagger();
app.UseSwaggerUI(options =>
{
    var provider = app.Services.GetRequiredService<IApiVersionDescriptionProvider>();
    foreach (var description in provider.ApiVersionDescriptions)
    {
        options.SwaggerEndpoint(
            $"/swagger/{description.GroupName}/swagger.json",
            $"CulinaryBlog API {description.GroupName.ToUpperInvariant()}");
    }
});

// Tự động tạo Role Admin và User mặc định khi ứng dụng chạy
using (var scope = app.Services.CreateScope())
{
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    string[] roleNames = { "Admin", "User" };
    foreach (var roleName in roleNames)
    {
        if (!await roleManager.RoleExistsAsync(roleName))
        {
            await roleManager.CreateAsync(new IdentityRole(roleName));
        }
    }
}

app.UseHttpsRedirection();

// CORS phải chạy trước Authentication/Authorization để OPTIONS preflight được trả về
app.UseCors(CorsPolicyName);

// Rate limiter cần chạy sau routing để đọc được policy theo endpoint (EnableRateLimiting)
app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapOpenApi();
app.MapScalarApiReference();

app.Run();

// Xác định cửa sổ thời gian của policy đang bị chặn để tính Retry-After
static int GetPolicyWindowSeconds(HttpContext httpContext, int authWindowSeconds, int globalWindowSeconds)
{
    var policyMetadata = httpContext.GetEndpoint()?.Metadata
        .GetMetadata<Microsoft.AspNetCore.RateLimiting.EnableRateLimitingAttribute>();
    return string.Equals(policyMetadata?.PolicyName, "auth", StringComparison.OrdinalIgnoreCase)
        ? authWindowSeconds
        : globalWindowSeconds;
}

// Cấu hình Swagger theo từng API version
public sealed class ConfigureSwaggerOptions : IConfigureOptions<SwaggerGenOptions>
{
    private readonly IApiVersionDescriptionProvider _provider;

    public ConfigureSwaggerOptions(IApiVersionDescriptionProvider provider)
    {
        _provider = provider;
    }

    public void Configure(SwaggerGenOptions options)
    {
        foreach (var description in _provider.ApiVersionDescriptions)
        {
            options.SwaggerDoc(description.GroupName, new OpenApiInfo
            {
                Title = "CulinaryBlog API",
                Version = description.ApiVersion.ToString(),
                Description = description.IsDeprecated
                    ? "API version đã ngừng hỗ trợ."
                    : "Tài liệu API Culinary Blog (JWT Bearer)."
            });
        }

        options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Description = "Nhập JWT access token (không cần tiền tố 'Bearer')."
        });

        options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
        {
            [new OpenApiSecuritySchemeReference("Bearer", document)] = new List<string>()
        });

        var xmlFile = $"{typeof(ConfigureSwaggerOptions).Assembly.GetName().Name}.xml";
        var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
        if (File.Exists(xmlPath))
        {
            options.IncludeXmlComments(xmlPath, includeControllerXmlComments: true);
        }
    }
}
