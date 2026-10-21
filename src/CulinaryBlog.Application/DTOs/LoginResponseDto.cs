namespace CulinaryBlog.Application.DTOs;

/// <summary>
/// Kết quả đăng nhập thành công: JWT và thông tin người dùng.
/// </summary>
public class LoginResponseDto
{
    /// <summary>JWT access token dùng cho header Authorization: Bearer.</summary>
    public string AccessToken { get; set; } = string.Empty;

    /// <summary>Thời điểm token hết hạn (UTC).</summary>
    public DateTime Expiration { get; set; }

    /// <summary>Id của người dùng (IdentityUser.Id).</summary>
    public string UserId { get; set; } = string.Empty;

    /// <summary>Email đăng nhập.</summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>Tên hiển thị.</summary>
    public string? Name { get; set; }

    /// <summary>Danh sách role của người dùng.</summary>
    public IReadOnlyList<string> Roles { get; set; } = Array.Empty<string>();
}
