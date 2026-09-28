using CulinaryBlog.Domain.Entities;

namespace CulinaryBlog.Application.Contracts
{
    public interface IUnitOfWork
    {
        // Thêm recipe
        Task AddRecipeAsync(Recipe recipe);

        // Lưu thay đổi vào database
        Task<int> SaveChangesAsync();
    }
}