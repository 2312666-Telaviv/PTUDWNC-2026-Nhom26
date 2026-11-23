using Asp.Versioning;
using Asp.Versioning.ApiExplorer;
using CulinaryBlog.Application.Services;
using CulinaryBlog.Domain.Entities;
using CulinaryBlog.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
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

    // Chính sách mặc định áp cho toàn bộ endpoint (MapControllers dùng policy này)
    options.AddPolicy("global", httpContext =>
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

// Đăng ký ImageService cho việc upload ảnh công thức
builder.Services.AddScoped<CulinaryBlog.Application.Services.IImageService, CulinaryBlog.Infrastructure.Services.ImageService>();

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

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<CulinaryBlog.Infrastructure.Persistence.ApplicationDbContext>();
    await dbContext.Database.MigrateAsync();

    if (!await dbContext.Categories.AnyAsync())
    {
        dbContext.Categories.AddRange(
            new Category { Name = "Món chính", Slug = "mon-chinh" },
            new Category { Name = "Món khai vị", Slug = "mon-khai-vi" },
            new Category { Name = "Món canh / Súp", Slug = "mon-canh-sup" },
            new Category { Name = "Món xào / Kho", Slug = "mon-xao-kho" },
            new Category { Name = "Món ăn vặt", Slug = "mon-an-vat" },
            new Category { Name = "Món chay", Slug = "mon-chay" },
            new Category { Name = "Tráng miệng & Bánh", Slug = "trang-mieng-banh" },
            new Category { Name = "Đồ uống", Slug = "do-uong" }
        );
        await dbContext.SaveChangesAsync();
    }
}

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

    var dbContext = scope.ServiceProvider.GetRequiredService<CulinaryBlog.Infrastructure.Persistence.ApplicationDbContext>();

    // Tài khoản demo để đăng nhập ngay sau khi chạy ứng dụng
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<IdentityUser>>();
    const string demoEmail = "demo@culinaryblog.com";
    const string demoPassword = "Demo@123";

    if (await userManager.FindByEmailAsync(demoEmail) == null)
    {
        var demoUser = new IdentityUser
        {
            UserName = demoEmail,
            Email = demoEmail,
            EmailConfirmed = true
        };

        var result = await userManager.CreateAsync(demoUser, demoPassword);
        if (result.Succeeded)
        {
            await userManager.AddToRoleAsync(demoUser, "User");
        }
    }

    if (app.Environment.IsDevelopment())
    {
        await SeedAdminAsync(
            builder.Configuration,
            userManager,
            roleManager,
            dbContext);
    }
}

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<CulinaryBlog.Infrastructure.Persistence.ApplicationDbContext>();
    var demoUserId = await dbContext.Users
        .Where(user => user.Email == "demo@culinaryblog.com")
        .Select(user => user.Id)
        .FirstOrDefaultAsync();

    if (!string.IsNullOrEmpty(demoUserId))
    {
        var samples = new[]
        {
            CreateSeedRecipe(
                "Cà phê trứng Hà Nội", "ca-phe-trung-ha-noi", "Đồ uống",
                "Cà phê trứng béo ngậy, thơm vị rang xay Hà Nội, ngon nhất khi thưởng thức ấm.",
                10, 5, 2, "Easy", SeedImage("photo-1509042239860-f550ce710b93"), 1, 118, 920,
                new[] { "Cà phê đen|2 muỗng canh", "Trứng gà|2 quả", "Sữa đặc|3 muỗng canh", "Đá|200g" },
                new[] { "Pha cà phê đen đặc, để nguội bớt.", "Đánh tan trứng với sữa đặc đến khi bông mịn.", "Đổ cà phê vào ly, thêm lớp trứng lên trên.", "Thưởng thức ngay khi còn ấm để lớp trứng béo và mịn." }),
            CreateSeedRecipe(
                "Trà đào cam sả", "tra-dao-cam-sa", "Đồ uống",
                "Trà đào thanh mát quyện cam và sả, giải khát ngày hè mà vẫn nhẹ nhàng.",
                8, 0, 2, "Easy", SeedImage("photo-1544787219-7f47ccb76574"), 2, 96, 780,
                new[] { "Trà mạn|2 muỗng canh", "Đào muối|80g", "Cam|1 quả", "Sả|2 nhánh", "Đá|200g" },
                new[] { "Pha trà mạn với nước sôi, ủ 5 phút rồi lọc bã.", "Đập dập sả, vắt cam lấy nước.", "Cho đào muối, sả và cam vào ly trà.", "Thêm đá, khuấy đều và điều chỉnh vị chua ngọt." }),
            CreateSeedRecipe(
                "Sinh tố bơ", "sinh-to-bo", "Đồ uống",
                "Sinh tố bơ sánh mịn, béo tự nhiên, chỉ cần vài phút là có ly uống đã.",
                5, 0, 2, "Easy", SeedImage("photo-1553530666-ba11a7da3888"), 3, 64, 510,
                new[] { "Bơ chín|1 quả", "Sữa tươi|150ml", "Sữa đặc|2 muỗng canh", "Đá|150g" },
                new[] { "Bóc bơ, bỏ hạt rồi cắt miếng.", "Cho bơ, sữa tươi, sữa đặc và đá vào máy xay.", "Xay đến khi hỗn hợp sánh mịn.", "Đổ ra ly, thưởng thức ngay." }),
            CreateSeedRecipe(
                "Bánh tráng trộn", "banh-trang-tron", "Món ăn vặt",
                "Bánh tráng trộn chua cay mặn ngọt, giòn dai, cực kỳ gây nghiện.",
                15, 5, 3, "Easy", SeedImage("photo-1607532941433-304659e8198a"), 4, 112, 890,
                new[] { "Bánh tráng|200g", "Xoài xanh|1 quả", "Đậu phộng|50g", "Khô bò|80g", "Nước mắm chua ngọt|3 muỗng canh" },
                new[] { "Cắt bánh tráng thành sợi vừa ăn.", "Bào xoài xanh, rang đậu phộng giòn.", "Xé khô bò, trộn tất cả nguyên liệu với nước mắm chua ngọt.", "Rắc thêm ớt và rau răm trước khi thưởng thức." }),
            CreateSeedRecipe(
                "Nem chua rán", "nem-chua-ran", "Món ăn vặt",
                "Nem chua rán giòn rụm, chua nhẹ, chấm tương ớt là hết ý.",
                10, 10, 3, "Easy", SeedImage("photo-1562967914-608f82629710"), 5, 87, 690,
                new[] { "Nem chua|10 miếng", "Bột chiên giòn|100g", "Trứng|1 quả", "Dầu ăn|200ml" },
                new[] { "Cắt nem chua thành miếng vừa ăn.", "Lăn nem qua trứng rồi áo bột chiên giòn.", "Chiên ngập dầu đến khi vàng ruộm.", "Vớt ra giấy thấm dầu, chấm tương ớt." }),
            CreateSeedRecipe(
                "Canh chua cá lóc", "canh-chua-ca-loc", "Món canh / Súp",
                "Bát canh chua thanh ngọt, có cá lóc, dứa, đậu bắp và ngò om.",
                15, 20, 4, "Easy", SeedImage("photo-1563245372-f21724e3856d"), 6, 103, 840,
                new[] { "Cá lóc|400g", "Dứa|200g", "Cà chua|2 quả", "Đậu bắp|150g", "Me|50g" },
                new[] { "Làm sạch cá, cắt khúc rồi chiên sơ.", "Đun sôi nước, cho dứa và me vào tạo vị chua.", "Thêm cá, cà chua, đậu bắp, nấu đến khi cá chín.", "Nêm gia vị, rắc ngò om rồi tắt bếp." }),
            CreateSeedRecipe(
                "Súp lơ kem gà", "sup-lo-kem-ga", "Món canh / Súp",
                "Súp lơ mềm, nước dùng béo nhẹ, ngon và ấm bụng cho bữa tối.",
                10, 20, 3, "Easy", SeedImage("photo-1547592166-23ac45744acd"), 7, 58, 430,
                new[] { "Súp lơ|300g", "Ức gà|200g", "Sữa tươi|100ml", "Hành tây|1/2 củ", "Bơ|20g" },
                new[] { "Súp lơ cắt bông, rửa sạch.", "Phi thơm hành tây với bơ, thêm gà xào sơ.", "Cho súp lơ và nước vào nấu mềm, thêm sữa tươi.", "Xay nhuyệt một phần súp để sánh, nêm gia vị vừa ăn." }),
            CreateSeedRecipe(
                "Đậu phụ sốt cà chua", "dau-phu-sot-ca-chua", "Món chay",
                "Đậu phụ mềm sốt cà chua chua ngọt, ăn cơm nóng rất đưa miệng.",
                10, 15, 3, "Easy", SeedImage("photo-1608039829572-78524f79c4c7"), 8, 76, 620,
                new[] { "Đậu phụ|300g", "Cà chua|3 quả", "Hành lá|1 nắm", "Tỏi|2 tép", "Nước mắm chay|1 muỗng canh" },
                new[] { "Cắt đậu phụ thành miếng vuông, chiên vàng nhẹ.", "Phi tỏi, xào cà chua đến khi ra sốt.", "Cho đậu phụ vào, thêm nước mắm chay và nêm gia vị.", "Đun nhỏ lửa 5 phút, rắc hành lá trước khi ăn." }),
            CreateSeedRecipe(
                "Bún chay Huế", "bun-chay-hue", "Món chay",
                "Bún chay thanh đạm với nấm, đậu phụ và rau, vị ngọt từ rau củ.",
                20, 25, 3, "Easy", SeedImage("photo-1511690743698-d9d85f2fbf38"), 9, 69, 540,
                new[] { "Bún|200g", "Đậu phụ|150g", "Nấm hương|100g", "Rau cải|100g", "Gia vị chay|1 muỗng canh" },
                new[] { "Nấu nước dùng từ rau củ và nấm hương.", "Chiên đậu phụ vàng, trụng rau cải.", "Cho bún vào tô, thêm đậu phụ, nấm và rau.", "Chan nước dùng nóng, nêm gia vị chay vừa ăn." }),
            CreateSeedRecipe(
                "Phở bò Hà Nội", "pho-bo-ha-noi", "Món chính",
                "Phở bò Hà Nội với nước dùng trong ngọt, bánh phở mướt và rau thơm tươi.",
                30, 120, 4, "Hard", SeedImage("photo-1569718212165-3a8278d5f624"), 10, 120, 950,
                new[] { "Bánh phở|400g", "Thịt bò|300g", "Xương bò|500g", "Hành tây|1 củ", "Gia vị phở|1 gói" },
                new[] { "Ninh xương bò với hành tây và gia vị phở để lấy nước ngọt.", "Thái thịt bò mỏng, trụng bánh phở qua nước sôi.", "Xếp bánh phở và thịt vào tô, chan nước dùng nóng.", "Thêm hành lá, ngò rí, tương đen và ớt tùy khẩu vị." }),
            CreateSeedRecipe(
                "Cơm tấm sườn bì chả", "com-tam-suon-bi-cha", "Món chính",
                "Cơm tấm đầy đủ sườn nướng, bì, chả và nước mắm chua ngọt đặc trưng.",
                25, 30, 3, "Medium", SeedImage("photo-1544025162-d76694265947"), 11, 115, 910,
                new[] { "Cơm tấm|300g", "Sườn heo|300g", "Bì heo|100g", "Chả trứng|2 miếng", "Nước mắm pha|4 muỗng canh" },
                new[] { "Ướp sườn với gia vị rồi nướng hoặc áp chảo chín.", "Trộn bì với thịt, gia vị cho vừa ăn.", "Cơm tấm hấp nóng, xếp sườn, bì, chả ra đĩa.", "Chan nước mắm pha, thêm dưa leo và đồ luộc." }),
            CreateSeedRecipe(
                "Gỏi cuốn tôm thịt", "goi-cuon-tom-thit", "Món khai vị",
                "Gỏi cuốn tươi mát với tôm, thịt, bún và rau, chấm sốt hoisin rang tỏi.",
                25, 10, 4, "Easy", SeedImage("photo-1626645738196-c2a7c87a8f58"), 12, 98, 760,
                new[] { "Bánh tráng|8 tờ", "Tôm|200g", "Thịt ba chỉ|150g", "Bún|100g", "Rau sống|1 rổ" },
                new[] { "Luộc tôm và thịt ba chỉ đến chín, thái mỏng.", "Trụng bánh tráng qua nước ấm để mềm.", "Xếp rau, bún, tôm và thịt vào giữa rồi cuốn chặt.", "Pha sốt hoisin với tỏi rang, chấm gỏi cuốn." }),
            CreateSeedRecipe(
                "Chả giò miền Nam", "cha-gio-mien-nam", "Món khai vị",
                "Chả giò vàng giòn, nhân thịt tôm và rau củ, chấm nước mắm chua ngọt.",
                30, 15, 4, "Medium", SeedImage("photo-1541014741259-de529411b96a"), 13, 91, 720,
                new[] { "Bánh tráng cuốn|12 tờ", "Thịt xay|200g", "Tôm|150g", "Cà rốt|1 củ", "Khoai lang|1 củ" },
                new[] { "Băm nhuyễn tôm, trộn với thịt xay và rau củ bào sợi.", "Nêm gia vị, gói nhân vào bánh tráng rồi cuốn kín.", "Chiên chả giò đến khi vàng giòn.", "Vớt ra giấy thấm dầu, chấm nước mắm chua ngọt." }),
            CreateSeedRecipe(
                "Thịt kho tàu", "thit-kho-tau", "Món xào / Kho",
                "Thịt ba chỉ kho trứng mặn ngọt, sốt sánh, rất hợp ăn với cơm trắng nóng.",
                20, 60, 4, "Medium", SeedImage("photo-1555939594-58d7cb561ad1"), 14, 108, 860,
                new[] { "Thịt ba chỉ|500g", "Trứng|4 quả", "Nước dừa|300ml", "Nước mắm|2 muỗng canh", "Đường|1 muỗng canh" },
                new[] { "Thái thịt miếng vừa ăn, luộc sơ trứng rồi bóc vỏ.", "Phi thơm hành tỏi, cho thịt vào rim săn lại.", "Thêm nước dừa, nước mắm, đường và trứng.", "Kho lửa nhỏ đến khi thịt mềm, sốt sánh thì tắt bếp." }),
            CreateSeedRecipe(
                "Sườn xào chua ngọt", "suon-xao-chua-ngot", "Món xào / Kho",
                "Sườn heo áo sốt chua ngọt óng ả, thịt mềm, ăn rất hao cơm.",
                20, 25, 4, "Medium", SeedImage("photo-1432139555190-58524dae6a55"), 15, 94, 730,
                new[] { "Sườn heo|500g", "Hành tây|1/2 củ", "Cà chua|1 quả", "Nước mắm|2 muỗng canh", "Đường|2 muỗng canh" },
                new[] { "Chặt sườn miếng vừa ăn, luộc sơ rồi rửa sạch.", "Chiên sơ sườn đến khi hơi vàng.", "Phi hành tây, thêm cà chua và gia vị tạo sốt chua ngọt.", "Cho sườn vào áo sốt, đun đến khi sốt sánh thì tắt bếp." }),
            CreateSeedRecipe(
                "Chè đậu đỏ", "che-dau-do", "Tráng miệng & Bánh",
                "Chè đậu đỏ béo ngậy, ngọt thanh, ngon nhất khi ăn ấm hoặc để lạnh.",
                15, 40, 4, "Easy", SeedImage("photo-1488477181946-6428a0291777"), 16, 83, 660,
                new[] { "Đậu đỏ|200g", "Đường|120g", "Nước dừa|200ml", "Sữa tươi|100ml" },
                new[] { "Ngâm đậu đỏ 4 giờ cho mềm rồi đãi sạch.", "Nấu đậu đến khi chín mềm, thêm đường.", "Đổ nước dừa và sữa tươi, đun nhỏ lửa đến khi sánh.", "Múc chè ra ly, ăn ấm hoặc thêm đá." }),
            CreateSeedRecipe(
                "Bánh flan caramel", "banh-flan-caramel", "Tráng miệng & Bánh",
                "Bánh flan mịn, caramel ngọt nhẹ, mát lịm sau khi để lạnh.",
                15, 35, 6, "Medium", SeedImage("photo-1563805042-7684c019e1cb"), 17, 105, 820,
                new[] { "Trứng gà|4 quả", "Sữa tươi|300ml", "Đường|100g", "Vani|1 ống" },
                new[] { "Nấu đường thành caramel rồi đổ vào đáy khuôn.", "Đánh trứng với sữa, đường và vani, lọc hỗn hợp.", "Đổ vào khuôn, hấp cách thủy đến khi flan chín.", "Để nguội, làm lạnh rồi út bánh ra đĩa." }),
            CreateSeedRecipe(
                "Bánh chuối nướng", "banh-chuoi-nuong", "Tráng miệng & Bánh",
                "Bánh chuối nướng thơm lừng, ngọt tự nhiên, ăn nóng hoặc nguội đều ngon.",
                15, 35, 6, "Easy", SeedImage("photo-1598373182133-52452f7691ef"), 18, 72, 580,
                new[] { "Chuối chín|4 quả", "Trứng|2 quả", "Sữa tươi|100ml", "Đường|80g", "Bột mì|120g" },
                new[] { "Dầm chuối chín, trộn với trứng, sữa và đường.", "Thêm bột mì, khuấy đến khi hỗn hợp mịn.", "Đổ vào khuôn đã thoa dầu, rắc thêm chuối lát.", "Nướng đến khi bánh vàng mặt và chín giữa." })
        };

        var seedSlugs = samples.Select(recipe => recipe.Slug)
            .Concat(new[] { "tra-chanh-vat-chanh-tuoi", "banh-xeo-gion-tan" })
            .ToHashSet();

        var oldDemoRecipes = await dbContext.Recipes
            .Include(recipe => recipe.Steps)
            .Include(recipe => recipe.Ingredients)
            .Where(recipe => recipe.AuthorId == demoUserId && seedSlugs.Contains(recipe.Slug))
            .ToListAsync();

        dbContext.Recipes.RemoveRange(oldDemoRecipes);
        await dbContext.SaveChangesAsync();

        foreach (var recipe in samples)
        {
            recipe.AuthorId = demoUserId;
        }

        dbContext.Recipes.AddRange(samples);
        await dbContext.SaveChangesAsync();
    }
}

app.UseStaticFiles(); // Phục vụ ảnh upload trong wwwroot/images/recipes

app.UseHttpsRedirection();

// CORS phải chạy trước Authentication/Authorization để OPTIONS preflight được trả về
app.UseCors(CorsPolicyName);

// Rate limiter cần chạy sau routing để đọc được policy theo endpoint (EnableRateLimiting)
app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers().RequireRateLimiting("global");

app.MapOpenApi();
app.MapScalarApiReference();

app.Run();

static async Task SeedAdminAsync(
    IConfiguration configuration,
    UserManager<IdentityUser> userManager,
    RoleManager<IdentityRole> roleManager,
    CulinaryBlog.Infrastructure.Persistence.ApplicationDbContext dbContext)
{
    var email = configuration["SeedAdmin:Email"];
    var password = configuration["SeedAdmin:Password"];
    var roleName = configuration["SeedAdmin:Role"] ?? "Admin";
    var forceResetPassword = string.Equals(
        configuration["SeedAdmin:ForceResetPassword"],
        "true",
        StringComparison.OrdinalIgnoreCase);

    if (string.Equals(roleName, "admin", StringComparison.OrdinalIgnoreCase))
    {
        roleName = "Admin";
    }

    if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
    {
        return;
    }

    if (!await roleManager.RoleExistsAsync(roleName))
    {
        var roleResult = await roleManager.CreateAsync(new IdentityRole(roleName));
        if (!roleResult.Succeeded)
        {
            throw new InvalidOperationException(
                $"Không thể tạo role {roleName}: {string.Join("; ", roleResult.Errors.Select(error => error.Description))}");
        }
    }

    var admin = await userManager.FindByEmailAsync(email);
    if (admin == null)
    {
        admin = new IdentityUser
        {
            UserName = email,
            Email = email,
            EmailConfirmed = true
        };
        dbContext.SetUserFullName(admin, "Quản trị viên");

        var createResult = await userManager.CreateAsync(admin, password);
        if (!createResult.Succeeded)
        {
            throw new InvalidOperationException(
                $"Không thể tạo admin {email}: {string.Join("; ", createResult.Errors.Select(error => error.Description))}");
        }

        dbContext.SetUserCreatedAt(admin, DateTime.UtcNow);
        dbContext.SetIsDefaultPassword(admin, true);
    }
    else if (forceResetPassword)
    {
        var resetToken = await userManager.GeneratePasswordResetTokenAsync(admin);
        var resetResult = await userManager.ResetPasswordAsync(admin, resetToken, password);
        if (!resetResult.Succeeded)
        {
            throw new InvalidOperationException(
                $"Không thể đặt lại mật khẩu admin {email}: {string.Join("; ", resetResult.Errors.Select(error => error.Description))}");
        }

        dbContext.SetIsDefaultPassword(admin, true);
    }
    else if (await userManager.CheckPasswordAsync(admin, password))
    {
        dbContext.SetIsDefaultPassword(admin, true);
    }

    if (string.IsNullOrWhiteSpace(dbContext.GetUserFullName(admin)))
    {
        dbContext.SetUserFullName(admin, "Quản trị viên");
    }

    await dbContext.SaveChangesAsync();

    if (!await userManager.IsInRoleAsync(admin, roleName))
    {
        var roleAssignmentResult = await userManager.AddToRoleAsync(admin, roleName);
        if (!roleAssignmentResult.Succeeded)
        {
            throw new InvalidOperationException(
                $"Không thể gán role {roleName} cho {email}: {string.Join("; ", roleAssignmentResult.Errors.Select(error => error.Description))}");
        }
    }
}

static string SeedImage(string photoId) =>
    $"https://images.unsplash.com/{photoId}?auto=format&fit=crop&w=1200&q=80";

static Recipe CreateSeedRecipe(
    string title,
    string slug,
    string categoryName,
    string description,
    int prepTimeMinutes,
    int cookTimeMinutes,
    int servings,
    string difficulty,
    string imageUrl,
    int daysAgo,
    int likeCount,
    int viewCount,
    string[] ingredients,
    string[] steps)
{
    var publishedAt = DateTime.UtcNow.AddDays(-daysAgo);

    return new Recipe
    {
        Title = title,
        Description = description,
        Slug = slug,
        CategoryName = categoryName,
        PrepTimeMinutes = prepTimeMinutes,
        CookTimeMinutes = cookTimeMinutes,
        Servings = servings,
        Difficulty = difficulty,
        ImageUrl = imageUrl,
        Status = "Published",
        CreatedAt = publishedAt,
        UpdatedAt = publishedAt,
        PublishedAt = publishedAt,
        LikeCount = likeCount,
        ViewCount = viewCount,
        Instructions = string.Join("\n", steps.Select((step, index) => $"{index + 1}. {step}")),
        Ingredients = ingredients.Select(item =>
        {
            var parts = item.Split('|', 2);
            return new Ingredient
            {
                Name = parts[0],
                Quantity = parts.Length > 1 ? parts[1] : string.Empty
            };
        }).ToList(),
        Steps = steps.Select((instruction, index) => new Step
        {
            StepNumber = index + 1,
            Instruction = instruction
        }).ToList()
    };
}

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
