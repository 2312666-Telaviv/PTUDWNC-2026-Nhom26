using Asp.Versioning;
using CulinaryBlog.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace CulinaryBlog.API.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/admin")]
[Authorize(Policy = "AdminOnly")]
public class AdminController : ControllerBase
{
    private readonly UserManager<IdentityUser> _userManager;
    private readonly ApplicationDbContext _dbContext;

    public AdminController(UserManager<IdentityUser> userManager, ApplicationDbContext dbContext)
    {
        _userManager = userManager;
        _dbContext = dbContext;
    }

    [HttpGet("users")]
    [ProducesResponseType(typeof(AdminUsersResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<AdminUsersResponse>> GetUsers(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = _userManager.Users.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(search))
        {
            var keyword = search.Trim();
            query = query.Where(user =>
                (user.Email != null && user.Email.Contains(keyword)) ||
                (user.UserName != null && user.UserName.Contains(keyword)) ||
                (EF.Property<string?>(user, "FullName") ?? string.Empty).Contains(keyword));
        }

        var totalCount = await query.CountAsync();
        var rows = await query
            .OrderBy(user => user.UserName)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(user => new
            {
                User = user,
                CreatedAt = EF.Property<DateTime>(user, "CreatedAt"),
                IsDefaultPassword = EF.Property<bool>(user, "IsDefaultPassword"),
                FullName = EF.Property<string?>(user, "FullName") ?? string.Empty
            })
            .ToListAsync();

        var items = new List<AdminUserDto>();
        foreach (var row in rows)
        {
            var user = row.User;
            var roles = await _userManager.GetRolesAsync(user);
            items.Add(new AdminUserDto
            {
                Id = user.Id,
                Email = user.Email ?? string.Empty,
                FullName = row.FullName,
                Role = roles.FirstOrDefault() ?? "User",
                IsLocked = user.LockoutEnd.HasValue && user.LockoutEnd.Value > DateTimeOffset.UtcNow,
                IsDefaultPassword = row.IsDefaultPassword,
                CreatedAt = row.CreatedAt
            });
        }

        return Ok(new AdminUsersResponse
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        });
    }

    [HttpPut("users/{id}/lock")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> LockUser(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
        {
            return NotFound(new { message = "Không tìm thấy người dùng!" });
        }

        if (string.Equals(user.Id, _userManager.GetUserId(User), StringComparison.Ordinal))
        {
            return BadRequest(new { message = "Không thể khóa chính tài khoản của bạn!" });
        }

        user.LockoutEnabled = true;
        user.LockoutEnd = DateTimeOffset.UtcNow.AddYears(100);
        await _userManager.UpdateAsync(user);

        return Ok(new { message = $"Đã khóa tài khoản {user.Email}!" });
    }

    [HttpPut("users/{id}/unlock")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UnlockUser(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
        {
            return NotFound(new { message = "Không tìm thấy người dùng!" });
        }

        user.LockoutEnabled = true;
        user.LockoutEnd = null;
        await _userManager.UpdateAsync(user);

        return Ok(new { message = $"Đã mở khóa tài khoản {user.Email}!" });
    }

    [HttpPut("users/{id}/role")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateUserRole(string id, [FromBody] UpdateUserRoleRequest model)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
        {
            return NotFound(new { message = "Không tìm thấy người dùng!" });
        }

        var currentUserId = _userManager.GetUserId(User);
        if (string.Equals(user.Id, currentUserId, StringComparison.Ordinal) &&
            !string.Equals(model.Role, "Admin", StringComparison.Ordinal))
        {
            return BadRequest(new { message = "Không thể tự thu hồi quyền Admin của chính bạn!" });
        }

        var currentRoles = await _userManager.GetRolesAsync(user);
        if (currentRoles.Count > 0)
        {
            var removeResult = await _userManager.RemoveFromRolesAsync(user, currentRoles);
            if (!removeResult.Succeeded)
            {
                return BadRequest(removeResult.Errors);
            }
        }

        var addResult = await _userManager.AddToRoleAsync(user, model.Role);
        if (!addResult.Succeeded)
        {
            return BadRequest(addResult.Errors);
        }

        return Ok(new { message = $"Đã đổi role của {user.Email} thành {model.Role}!" });
    }

    [HttpDelete("users/{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteUser(string id)
    {
        if (string.Equals(id, _userManager.GetUserId(User), StringComparison.Ordinal))
        {
            return BadRequest(new { message = "Không thể xóa chính tài khoản của bạn!" });
        }

        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
        {
            return NotFound(new { message = "Không tìm thấy người dùng!" });
        }

        var roles = await _userManager.GetRolesAsync(user);
        if (roles.Contains("Admin", StringComparer.Ordinal))
        {
            var adminCount = (await _userManager.GetUsersInRoleAsync("Admin")).Count;
            if (adminCount <= 1)
            {
                return BadRequest(new { message = "Không thể xóa quản trị viên cuối cùng!" });
            }
        }

        var hasRelatedData = await _dbContext.Recipes.AnyAsync(recipe => recipe.AuthorId == user.Id);
        if (hasRelatedData)
        {
            user.LockoutEnabled = true;
            user.LockoutEnd = DateTimeOffset.UtcNow.AddYears(100);
            await _userManager.UpdateAsync(user);

            return Ok(new
            {
                message = $"Tài khoản {user.Email} có công thức liên quan nên không thể xóa. Đã khóa tài khoản thay thế!",
                softLocked = true
            });
        }

        var deleteResult = await _userManager.DeleteAsync(user);
        if (!deleteResult.Succeeded)
        {
            return BadRequest(deleteResult.Errors);
        }

        return Ok(new
        {
            message = $"Đã xóa tài khoản {user.Email}!",
            softLocked = false
        });
    }

    public class AdminUserDto
    {
        public string Id { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = "User";
        public bool IsLocked { get; set; }
        public bool IsDefaultPassword { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class AdminUsersResponse
    {
        public List<AdminUserDto> Items { get; set; } = new();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }

    public class UpdateUserRoleRequest
    {
        [Required]
        [RegularExpression("^(Admin|User)$")]
        public string Role { get; set; } = string.Empty;
    }
}
