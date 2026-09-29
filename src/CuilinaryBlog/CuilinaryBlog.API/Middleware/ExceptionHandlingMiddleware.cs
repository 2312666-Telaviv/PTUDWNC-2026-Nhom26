using CulinaryBlog.Domain.Exceptions;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Text.Json;

namespace CulinaryBlog.API.Middleware
{
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;

        public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(context, ex);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            _logger.LogError(exception, "An unexpected error occurred");

            var statusCode = exception switch
            {
                NotFoundException => (int)HttpStatusCode.NotFound,          // 404
                ValidationException => (int)HttpStatusCode.BadRequest,      // 400
                DomainException => (int)HttpStatusCode.BadRequest,          // 400
                _ => (int)HttpStatusCode.InternalServerError                // 500
            };

            var problemDetails = new ProblemDetails
            {
                Status = statusCode,
                Title = GetTitle(exception),
                Detail = exception.Message,
                Instance = context.Request.Path
            };

            // Nếu là ValidationException thì thêm danh sách lỗi
            if (exception is ValidationException validationEx && validationEx.Errors.Any())
            {
                problemDetails.Extensions["errors"] = validationEx.Errors;
            }

            context.Response.ContentType = "application/problem+json";
            context.Response.StatusCode = statusCode;

            var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
            var json = JsonSerializer.Serialize(problemDetails, options);

            await context.Response.WriteAsync(json);
        }

        private static string GetTitle(Exception exception)
        {
            return exception switch
            {
                NotFoundException => "Not Found",
                ValidationException => "Validation Error",
                DomainException => "Domain Error",
                _ => "Internal Server Error"
            };
        }
    }
}