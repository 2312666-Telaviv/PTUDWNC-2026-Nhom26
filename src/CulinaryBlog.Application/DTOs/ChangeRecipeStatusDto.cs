using System.ComponentModel.DataAnnotations;

namespace CulinaryBlog.Application.DTOs
{
    /// <summary>
    /// Yêu cầu chuyển trạng thái công thức: Draft -> Published -> Archived / Deleted.
    /// </summary>
    public class ChangeRecipeStatusDto
    {
        [Required]
        public string Status { get; set; } = string.Empty;
    }
}
