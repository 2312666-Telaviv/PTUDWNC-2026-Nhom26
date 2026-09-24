using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CulinaryBlog.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class BlogController : ControllerBase
{
    // API công khai ai cũng gọi được
    [HttpGet("public")]
    public IActionResult GetPublicBlogs()
    {
        return Ok(new[] { "Bài viết 1: Phở Hà Nội", "Bài viết 2: Bún bò Huế" });
    }

    // API bắt buộc phải có JWT Token hợp lệ mới gọi được
    [HttpGet("private")]
    [Authorize]
    public IActionResult GetPrivateBlogs()
    {
        var username = User.Identity?.Name;
        return Ok(new { message = $"Xin chào {username}! Đây là dữ liệu bảo mật chỉ user đã đăng nhập mới xem được." });
    }
}