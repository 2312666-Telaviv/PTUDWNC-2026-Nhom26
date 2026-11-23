using Microsoft.AspNetCore.Identity;
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

        public DateTime GetUserCreatedAt(IdentityUser user) =>
            Entry(user).Property<DateTime>("CreatedAt").CurrentValue;

        public void SetUserCreatedAt(IdentityUser user, DateTime value) =>
            Entry(user).Property<DateTime>("CreatedAt").CurrentValue = value;

        public bool GetIsDefaultPassword(IdentityUser user) =>
            Entry(user).Property<bool>("IsDefaultPassword").CurrentValue;

        public void SetIsDefaultPassword(IdentityUser user, bool value) =>
            Entry(user).Property<bool>("IsDefaultPassword").CurrentValue = value;

        public string GetUserFullName(IdentityUser user) =>
            Entry(user).Property<string>("FullName").CurrentValue ?? string.Empty;

        public void SetUserFullName(IdentityUser user, string value) =>
            Entry(user).Property<string>("FullName").CurrentValue = value;

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<IdentityUser>(entity =>
            {
                entity.Property<DateTime>("CreatedAt").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property<bool>("IsDefaultPassword").HasDefaultValue(false);
                entity.Property<string>("FullName").IsRequired().HasMaxLength(50).HasDefaultValue(string.Empty);
            });

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