namespace CulinaryBlog.Domain.Entities
{
    public class Recipe
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;

        // Khóa ngoại hoặc định danh Author (IdentityUser hoặc User tùy project bạn)
        public string AuthorId { get; set; } = string.Empty;
        public virtual Microsoft.AspNetCore.Identity.IdentityUser Author { get; set; } = null!;

        // Thời gian chuẩn bị và nấu (phút)
        public int PrepTimeMinutes { get; set; }
        public int CookTimeMinutes { get; set; }

        // Số lượng người ăn
        public int Servings { get; set; }

        // Độ khó: Easy, Medium, Hard
        public string Difficulty { get; set; } = "Easy";

        // Tên danh mục
        public string CategoryName { get; set; } = string.Empty;

        // Hướng dẫn nấu ăn chi tiết
        public string? Instructions { get; set; }

        // Ngày tạo
        public DateTime CreatedAt { get; set; }

        // Đường dẫn ảnh công thức (lưu trong wwwroot/images/recipes)
        public string? ImageUrl { get; set; }

        // Trạng thái công thức: Draft -> Published -> Archived (hoặc Deleted)
        public string Status { get; set; } = "Draft";

        // Thời gian cập nhật / xuất bản gần nhất
        public DateTime? UpdatedAt { get; set; }
        public DateTime? PublishedAt { get; set; }

        // Mức độ yêu thích của cộng đồng
        public int LikeCount { get; set; }
        public int ViewCount { get; set; }

        // Các mối quan hệ 1-nhiều tương ứng với .Include() ở Controller
        public virtual ICollection<Step> Steps { get; set; } = new List<Step>();
        public virtual ICollection<Ingredient> Ingredients { get; set; } = new List<Ingredient>();
    }
}
