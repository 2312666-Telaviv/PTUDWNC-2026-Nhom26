using Asp.Versioning;
using CulinaryBlog.Application.DTOs;
using CulinaryBlog.Application.Services;
using CulinaryBlog.Infrastructure.Persistence;
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
    private readonly ApplicationDbContext _dbContext;

    public AuthController(
        UserManager<IdentityUser> userManager,
        ITokenService tokenService,
        IConfiguration configuration,
        ApplicationDbContext dbContext)
    {
        _userManager = userManager;
        _tokenService = tokenService;
        _configuration = configuration;
        _dbContext = dbContext;
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
        var fullName = model.FullName?.Trim() ?? string.Empty;
        var email = model.Email?.Trim() ?? string.Empty;
        var password = model.Password ?? string.Empty;
        var confirmPassword = model.ConfirmPassword ?? string.Empty;

        if (string.IsNullOrWhiteSpace(email))
        {
            return BadRequest(new { message = "Vui lòng nhập email." });
        }
        if (!IsValidEmail(email))
        {
            return BadRequest(new { message = "Email không hợp lệ." });
        }
        if (string.IsNullOrWhiteSpace(password))
        {
            return BadRequest(new { message = "Vui lòng nhập mật khẩu." });
        }
        if (password.Length < 6)
        {
            return BadRequest(new { message = "Mật khẩu phải có ít nhất 6 ký tự." });
        }
        if (string.IsNullOrWhiteSpace(confirmPassword))
        {
            return BadRequest(new { message = "Vui lòng nhập xác nhận mật khẩu." });
        }
        if (!string.Equals(password, confirmPassword, StringComparison.Ordinal))
        {
            return BadRequest(new { message = "Mật khẩu xác nhận không khớp." });
        }

        var fullNameError = ValidateFullName(fullName, email);
        if (fullNameError != null)
        {
            return BadRequest(new { message = fullNameError });
        }

        if (await _userManager.FindByEmailAsync(email) != null)
        {
            return BadRequest(new { message = "Email đã được sử dụng." });
        }

        var user = new IdentityUser { UserName = email, Email = email };
        _dbContext.SetUserFullName(user, fullName);
        var result = await _userManager.CreateAsync(user, password);

        if (!result.Succeeded)
        {
            var isDuplicate = result.Errors.Any(error =>
                error.Code is "DuplicateEmail" or "DuplicateUserName");
            var message = isDuplicate
                ? "Email đã được sử dụng."
                : string.Join("; ", result.Errors.Select(error => error.Description));
            return BadRequest(new { message });
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
            FullName = _dbContext.GetUserFullName(user),
            Roles = userRoles.ToList(),
            IsDefaultPassword = _dbContext.GetIsDefaultPassword(user)
        });
    }

    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto model)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
            return NotFound(new { message = "Không tìm thấy người dùng!" });

        if (!string.Equals(user.Email, model.Email, StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new { message = "Email không khớp với tài khoản đang đăng nhập!" });
        }

        var result = await _userManager.ChangePasswordAsync(user, model.CurrentPassword, model.NewPassword);
        if (!result.Succeeded)
            return BadRequest(result.Errors);

        _dbContext.SetIsDefaultPassword(user, false);
        await _dbContext.SaveChangesAsync();

        return Ok(new { message = "Đổi mật khẩu thành công!" });
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto model)
    {
        var user = await _userManager.FindByEmailAsync(model.Email);
        if (user == null)
        {
            // Không tiết lộ xem email có tồn tại hay không (bảo mật)
            return Ok(new { message = "Nếu email tồn tại, liên kết đặt lại mật khẩu đã được gửi." });
        }

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        // Ở đây thường gửi email chứa token reset mật khẩu.
        // Trong ví dụ này, chúng tôi trả về token (trong thực tế KHÔNG nên làm vậy với production).
        return Ok(new { message = "Liên kết đặt lại mật khẩu đã được gửi đến email của bạn.", resetToken = token });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto model)
    {
        var user = await _userManager.FindByEmailAsync(model.Email);
        if (user == null)
            return NotFound(new { message = "Không tìm thấy người dùng!" });

        var result = await _userManager.ResetPasswordAsync(user, model.Token, model.NewPassword);
        if (!result.Succeeded)
            return BadRequest(result.Errors);

        return Ok(new { message = "Đặt lại mật khẩu thành công!" });
    }

    [HttpGet("profile")]
    [Authorize]
    public async Task<IActionResult> GetProfile()
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
            return NotFound(new { message = "Không tìm thấy người dùng!" });

        var profile = new ProfileDto
        {
            Id = user.Id,
            Email = user.Email!,
            UserName = user.UserName!,
            FullName = _dbContext.GetUserFullName(user),
        };

        return Ok(profile);
    }

    [HttpPut("profile")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto model)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
            return NotFound(new { message = "Không tìm thấy người dùng!" });

        var fullName = model.FullName?.Trim() ?? string.Empty;
        var fullNameError = ValidateFullName(fullName, user.Email);
        if (fullNameError != null)
        {
            return BadRequest(new { message = fullNameError });
        }

        _dbContext.SetUserFullName(user, fullName);

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
            return BadRequest(result.Errors);

        return Ok(new { message = "Cập nhật hồ sơ thành công!", fullName });
    }

    [HttpPost("logout")]
    [Authorize]
    public IActionResult Logout()
    {
        // Với JWT stateless, logout chủ yếu được xử lý ở client (xóa token).
        // Endpoint này có thể dùng để invalidate token trên server nếu có blacklist.
        return Ok(new { message = "Đăng xuất thành công!" });
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

    private static bool IsValidEmail(string value)
    {
        try
        {
            return string.Equals(new System.Net.Mail.MailAddress(value).Address, value, StringComparison.OrdinalIgnoreCase);
        }
        catch
        {
            return false;
        }
    }

    private static string? ValidateFullName(string fullName, string? email)
    {
        var value = fullName?.Trim() ?? string.Empty;
        if (value.Length == 0)
        {
            return "Vui lòng nhập họ tên.";
        }
        if (value.Length < 2 || value.Length > 50)
        {
            return "Họ tên phải có từ 2 đến 50 ký tự.";
        }
        if (value.Contains('<') || value.Contains('>'))
        {
            return "Họ tên không được chứa ký tự < hoặc >.";
        }
        if (!string.IsNullOrWhiteSpace(email) &&
            string.Equals(value, email.Trim(), StringComparison.OrdinalIgnoreCase))
        {
            return "Họ tên không được trùng với email.";
        }

        return null;
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

    public class ResetPasswordDto
    {
        public string Email { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
}
