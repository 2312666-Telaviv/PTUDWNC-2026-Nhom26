using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using CulinaryBlog.Domain.Entities;

namespace CulinaryBlog.Infrastructure.Persistence
{
    public class ApplicationDbContext : IdentityDbContext<Microsoft.AspNetCore.Identity.IdentityUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<Recipe> Recipes { get; set; }
        public DbSet<Category> Categories { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Giá trị mặc định khi thêm bản ghi cũ / chưa set trạng thái
            builder.Entity<Recipe>()
                .Property(r => r.Status)
                .HasDefaultValue("Draft");

            builder.Entity<Category>(entity =>
            {
                entity.ToTable("Categories");
                entity.HasKey(c => c.Id);
                entity.Property(c => c.Name).IsRequired().HasMaxLength(100);
                entity.Property(c => c.Slug).IsRequired().HasMaxLength(100);
                entity.HasIndex(c => c.Name).IsUnique();
                entity.HasIndex(c => c.Slug).IsUnique();
            });
        }
    }
}