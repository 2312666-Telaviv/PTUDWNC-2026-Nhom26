using System.IO;
using System.Threading.Tasks;

namespace CulinaryBlog.Application.Services
{
    public interface IImageService
    {
        /// <summary>
        /// Lưu tệp ảnh vào thư mục wwwroot/images/recipes và trả về URL truy cập.
        /// </summary>
        Task<string> UploadImageAsync(Stream fileStream, string fileName, string contentType);

        /// <summary>
        /// Xóa ảnh đã lưu.
        /// </summary>
        Task<bool> DeleteImageAsync(string imageUrl);
    }
}
