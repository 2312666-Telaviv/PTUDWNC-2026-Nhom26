using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CulinaryBlog.API.Controllers;

/// <summary>
/// Endpoint mẫu kiểm tra truy cập công khai và bảo vệ bằng JWT.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
public class BlogController : ControllerBase
{
    /// <summary>
    /// API công khai, ai cũng gọi được.
    /// </summary>
    [HttpGet("public")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult GetPublicBlogs()
    {
        return Ok(new[] { "Bài viết 1: Phở Hà Nội", "Bài viết 2: Bánh bèo Huế" });
    }

    /// <summary>
    /// API bắt buộc phải có JWT hợp lệ.
    /// </summary>
    [HttpGet("private")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public IActionResult GetPrivateBlogs()
    {
        var username = User.Identity?.Name;
        return Ok(new { message = $"Xin chào {username}! Đây là dữ liệu bảo mật chỉ user đã đăng nhập mới xem được." });
    }
}
