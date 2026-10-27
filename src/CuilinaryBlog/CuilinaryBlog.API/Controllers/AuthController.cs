using CulinaryBlog.Application.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Asp.Versioning;

namespace CulinaryBlog.API.Controllers;

[ApiVersion("1.0")]
[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly UserManager<IdentityUser> _userManager;
    private readonly IConfiguration _configuration;

    public AuthController(UserManager<IdentityUser> userManager, IConfiguration configuration)
    {
        _userManager = userManager;
        _configuration = configuration;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto model)
    {
        var user = new IdentityUser { UserName = model.Email, Email = model.Email };
        var result = await _userManager.CreateAsync(user, model.Password);

        if (!result.Succeeded)
            return BadRequest(result.Errors);

        return Ok(new { message = "Đăng ký thành công!" });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto model)
    {
        var user = await _userManager.FindByEmailAsync(model.Email);
        if (user != null && await _userManager.CheckPasswordAsync(user, model.Password))
        {
            // Lấy danh sách Role của user để đưa vào token
            var userRoles = await _userManager.GetRolesAsync(user);

            // Tạo JWT Token kèm theo claims và roles
            var authClaims = new List<Claim>
        {
            new Claim(ClaimTypes.Name, user.Email!),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

            foreach (var userRole in userRoles)
            {
                authClaims.Add(new Claim(ClaimTypes.Role, userRole));
            }

            var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JwtSettings:Secret"]!));

            var token = new JwtSecurityToken(
                issuer: _configuration["JwtSettings:Issuer"],
                audience: _configuration["JwtSettings:Audience"],
                expires: DateTime.Now.AddHours(3),
                claims: authClaims,
                signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
            );

            return Ok(new
            {
                token = new JwtSecurityTokenHandler().WriteToken(token),
                expiration = token.ValidTo
            });
        }

        return Unauthorized(new { message = "Sai tài khoản hoặc mật khẩu!" });
    }

    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto model)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
            return NotFound(new { message = "Không tìm thấy người dùng!" });

        var result = await _userManager.ChangePasswordAsync(user, model.CurrentPassword, model.NewPassword);
        if (!result.Succeeded)
            return BadRequest(result.Errors);

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

        user.Email = model.Email;
        user.UserName = model.Email;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
            return BadRequest(result.Errors);

        return Ok(new { message = "Cập nhật hồ sơ thành công!" });
    }

    [HttpPost("logout")]
    [Authorize]
    public IActionResult Logout()
    {
        // Với JWT stateless, logout chủ yếu được xử lý ở client (xóa token).
        // Endpoint này có thể dùng để invalidate token trên server nếu có blacklist.
        return Ok(new { message = "Đăng xuất thành công!" });
    }

    [HttpPost("assign-role")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AssignRole([FromBody] AssignRoleDto model)
    {
        var user = await _userManager.FindByEmailAsync(model.Email);
        if (user == null)
            return NotFound(new { message = "Không tìm thấy người dùng!" });

        var result = await _userManager.AddToRoleAsync(user, model.Role);
        if (!result.Succeeded)
            return BadRequest(result.Errors);

        return Ok(new { message = $"Đã gán quyền {model.Role} cho user {model.Email} thành công!" });
    }

    [HttpGet("admin-only")]
    [Authorize(Roles = "Admin")]
    public IActionResult AdminOnlyEndpoint()
    {
        return Ok(new { message = "Chào Admin! Đây là khu vực tối mật chỉ Admin mới có quyền truy cập." });
    }

    public class AssignRoleDto
    {
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }

    public class ResetPasswordDto
    {
        public string Email { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
}
