using CulinaryBlog.Application.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using System.IO;
using System.Threading.Tasks;

namespace CulinaryBlog.Infrastructure.Services
{
    public class ImageService : IImageService
    {
        private readonly IWebHostEnvironment _env;
        private readonly IConfiguration _config;
        private const string ImagesFolder = "images/recipes";

        public ImageService(IWebHostEnvironment env, IConfiguration config)
        {
            _env = env;
            _config = config;
        }

        public async Task<string> UploadImageAsync(Stream fileStream, string fileName, string contentType)
        {
            // Chuẩn hóa tên file: loại bỏ ký tự đặc biệt, thêm timestamp
            var safeFileName = Path.GetFileNameWithoutExtension(fileName)
                .Replace(" ", "_")
                .Replace("/", "_")
                .Replace("\\", "_");
            var extension = Path.GetExtension(fileName);
            var uniqueFileName = $"{safeFileName}_{System.DateTime.UtcNow:yyyyMMddHHmmssfff}{extension}";

            // Đường dẫn thư mục lưu trữ: wwwroot/images/recipes
            var uploadsFolder = Path.Combine(_env.WebRootPath, ImagesFolder);
            Directory.CreateDirectory(uploadsFolder);

            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            // Ghi file vào ổ cứng
            using (var outputStream = new FileStream(filePath, FileMode.Create))
            {
                await fileStream.CopyToAsync(outputStream);
            }

            // Trả về URL tương ứng để front-end truy cập
            // Ví dụ: /images/recipes/recipe_20261028120000.jpg
            var baseUrl = _config["AppSettings:BaseUrl"] ?? string.Empty;
            var imageUrl = $"{baseUrl.TrimEnd('/')}/{ImagesFolder}/{uniqueFileName}";
            return imageUrl;
        }

        public Task<bool> DeleteImageAsync(string imageUrl)
        {
            try
            {
                if (string.IsNullOrEmpty(imageUrl) || string.IsNullOrEmpty(_env.WebRootPath))
                    return Task.FromResult(false);

                // Chỉ lấy tên file, tránh path traversal
                var fileName = Path.GetFileName(imageUrl);
                var filePath = Path.Combine(_env.WebRootPath, ImagesFolder, fileName);

                if (File.Exists(filePath))
                {
                    File.Delete(filePath);
                    return Task.FromResult(true);
                }

                return Task.FromResult(false);
            }
            catch
            {
                return Task.FromResult(false);
            }
        }
    }
}
