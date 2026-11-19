using System.ComponentModel.DataAnnotations;

namespace CulinaryBlog.Application.DTOs
{
    public class CreateRecipeDto
    {
        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [StringLength(2000)]
        public string Description { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Slug { get; set; } = string.Empty;

        [Required]
        [Range(1, 1440)]
        public int PrepTimeMinutes { get; set; }

        [Required]
        [Range(1, 1440)]
        public int CookTimeMinutes { get; set; }

        [Required]
        [Range(1, 50)]
        public int Servings { get; set; }

        [Required]
        public string Difficulty { get; set; } = "Easy";

        [Required]
        public string CategoryName { get; set; } = string.Empty;

        public string? Instructions { get; set; }

        // Trạng thái ban đầu: Draft (mặc định) hoặc Published
        public string? Status { get; set; } = "Draft";

        // Đường dẫn ảnh đã lưu trên server (được ImageService điền vào)
        public string? ImageUrl { get; set; }
    }
}
