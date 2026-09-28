namespace CulinaryBlog.Domain.Entities
{
    public class Recipe
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }

        // Khóa ngoại hoặc định danh Author (IdentityUser hoặc User tùy project bạn)
        public string AuthorId { get; set; }
        public virtual Microsoft.AspNetCore.Identity.IdentityUser Author { get; set; }

        // Các mối quan hệ 1-nhiều tương ứng với .Include() ở Controller
        public virtual ICollection<Step> Steps { get; set; }
        public virtual ICollection<Ingredient> Ingredients { get; set; }
    }
}