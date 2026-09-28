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
        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
       
        }
    }
}