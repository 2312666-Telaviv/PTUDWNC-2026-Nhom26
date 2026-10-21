using Asp.Versioning;
using CulinaryBlog.Application.DTOs;
using CulinaryBlog.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace CulinaryBlog.API.Controllers;

/// <summary>
/// Đăng ký, đăng nhập và quản lý role người dùng.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<IdentityUser> _userManager;
    private readonly ITokenService _tokenService;
    private readonly IConfiguration _configuration;

    public AuthController(
        UserManager<IdentityUser> userManager,
        ITokenService tokenService,
        IConfiguration configuration)
    {
        _userManager = userManager;
        _tokenService = tokenService;
        _configuration = configuration;
    }

    /// <summary>
    /// Đăng ký tài khoản mới với role mặc định "User".
    /// </summary>
    [HttpPost("register")]
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<IActionResult> Register([FromBody] RegisterDto model)
    {
        var user = new IdentityUser { UserName = model.Email, Email = model.Email };
        var result = await _userManager.CreateAsync(user, model.Password);

        if (!result.Succeeded)
        {
            return BadRequest(result.Errors);
        }

        await _userManager.AddToRoleAsync(user, "User");

        return Ok(new { message = "Đăng ký thành công!" });
    }

    /// <summary>
    /// Đăng nhập và nhận JWT access token.
    /// </summary>
    [HttpPost("login")]
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    [ProducesResponseType(typeof(LoginResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginDto model)
    {
        var user = await _userManager.FindByEmailAsync(model.Email);
        if (user == null || !await _userManager.CheckPasswordAsync(user, model.Password))
        {
            return Unauthorized(new { message = "Sai tài khoản hoặc mật khẩu!" });
        }

        var userRoles = await _userManager.GetRolesAsync(user);
        var token = _tokenService.CreateToken(user, userRoles);
        var durationInMinutes = _configuration.GetValue("JwtSettings:DurationInMinutes", 60);

        return Ok(new LoginResponseDto
        {
            AccessToken = token,
            Expiration = DateTime.UtcNow.AddMinutes(durationInMinutes),
            UserId = user.Id,
            Email = user.Email ?? string.Empty,
            Name = user.UserName,
            Roles = userRoles.ToList()
        });
    }

    /// <summary>
    /// Gán role cho người dùng (chỉ Admin).
    /// </summary>
    [HttpPost("assign-role")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AssignRole([FromBody] AssignRoleDto model)
    {
        var user = await _userManager.FindByEmailAsync(model.Email);
        if (user == null)
        {
            return NotFound(new { message = "Không tìm thấy người dùng!" });
        }

        var result = await _userManager.AddToRoleAsync(user, model.Role);
        if (!result.Succeeded)
        {
            return BadRequest(result.Errors);
        }

        return Ok(new { message = $"Đã gán quyền {model.Role} cho user {model.Email} thành công!" });
    }

    /// <summary>
    /// Endpoint kiểm tra quyền Admin.
    /// </summary>
    [HttpGet("admin-only")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public IActionResult AdminOnlyEndpoint()
    {
        return Ok(new { message = "Chào Admin! Đây là khu vực tối mật chỉ Admin mới có quyền truy cập." });
    }

    /// <summary>
    /// Dữ liệu gán role cho người dùng.
    /// </summary>
    public class AssignRoleDto
    {
        /// <summary>Email người dùng cần gán role.</summary>
        public string Email { get; set; } = string.Empty;

        /// <summary>Tên role cần gán (Admin hoặc User).</summary>
        public string Role { get; set; } = string.Empty;
    }
}
