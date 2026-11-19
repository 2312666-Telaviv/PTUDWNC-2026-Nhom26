using CulinaryBlog.Application.DTOs;
using CulinaryBlog.Application.Services;
using CulinaryBlog.Domain.Entities;
using CulinaryBlog.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;
using System.Security.Claims;
using Asp.Versioning;

namespace CulinaryBlog.API.Controllers
{
    [ApiVersion("1.0")]
    [Route("api/v1/recipes")]
    [ApiController]
    public class RecipesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IImageService _imageService;

        // Các trạng thái hợp lệ và luồng chuyển trạng thái cho phép
        private static readonly Dictionary<string, string[]> StatusTransitions = new(StringComparer.OrdinalIgnoreCase)
        {
            ["Draft"] = new[] { "Published", "Deleted" },
            ["Published"] = new[] { "Archived", "Deleted" },
            ["Archived"] = new[] { "Published", "Deleted" },
            ["Deleted"] = new[] { "Draft" } // khôi phục bản nháp
        };

        public RecipesController(ApplicationDbContext context, IImageService imageService)
        {
            _context = context;
            _imageService = imageService;
        }

        private string CurrentUserId =>
            User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("sub")?.Value
            ?? string.Empty;

        private static string NormalizeStatus(string? status)
        {
            if (string.IsNullOrWhiteSpace(status)) return "Draft";
            var value = status.Trim();
            return char.ToUpperInvariant(value[0]) + value.Substring(1).ToLowerInvariant();
        }

        private static object MapRecipe(Recipe r) => new
        {
            id = r.Id,
            title = r.Title,
            description = r.Description,
            slug = r.Slug,
            imageUrl = r.ImageUrl,
            primaryImageUrl = r.ImageUrl,
            prepTimeMinutes = r.PrepTimeMinutes,
            cookTimeMinutes = r.CookTimeMinutes,
            servings = r.Servings,
            difficulty = r.Difficulty,
            categoryName = r.CategoryName,
            instructions = r.Instructions,
            status = r.Status,
            authorId = r.AuthorId,
            authorName = r.Author?.Email ?? string.Empty,
            createdAt = r.CreatedAt,
            updatedAt = r.UpdatedAt,
            publishedAt = r.PublishedAt,
            steps = r.Steps,
            ingredients = r.Ingredients
        };

        private async Task<(string? Url, string? Error)> SaveImageAsync(IFormFile? file)
        {
            if (file == null || file.Length == 0) return (null, null);

            var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif" };
            if (!allowedTypes.Contains(file.ContentType.ToLowerInvariant()))
                return (null, "Chỉ chấp nhận file ảnh (jpg, png, webp, gif).");

            if (file.Length > 10_000_000)
                return (null, "Kích thước ảnh không được vượt quá 10MB.");

            var url = await _imageService.UploadImageAsync(
                file.OpenReadStream(), file.FileName, file.ContentType);
            return (url, null);
        }

        /// <summary>
        /// Lấy danh sách công thức (có phân trang, lọc theo trạng thái) + thông tin benchmark.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetRecipes(
            [FromQuery] string mode = "split",
            [FromQuery] string? status = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var stopwatch = Stopwatch.StartNew();

            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 10;

            IQueryable<Recipe> query = _context.Recipes
                .Include(r => r.Author)
                .Include(r => r.Steps)
                .Include(r => r.Ingredients);

            // Mặc định ẩn các công thức đã xóa
            if (!string.IsNullOrWhiteSpace(status))
            {
                var normalized = NormalizeStatus(status);
                query = query.Where(r => r.Status == normalized);
            }
            else
            {
                query = query.Where(r => r.Status != "Deleted");
            }

            var totalCount = await query.CountAsync();

            query = query.OrderByDescending(r => r.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize);

            List<Recipe> recipes = mode.Equals("split", StringComparison.OrdinalIgnoreCase)
                ? await query.AsSplitQuery().ToListAsync()
                : await query.ToListAsync();

            stopwatch.Stop();

            var mapped = recipes.Select(MapRecipe).ToList();
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            return Ok(new
            {
                // Thông tin benchmark (lab EF Core)
                executionTimeMs = stopwatch.ElapsedMilliseconds,
                mode,
                // Dữ liệu phân trang cho frontend
                items = mapped,
                data = mapped,
                totalCount,
                totalRecipes = totalCount,
                page,
                pageSize,
                totalPages,
                hasNextPage = page < totalPages,
                hasPreviousPage = page > 1
            });
        }

        /// <summary>
        /// Lấy danh sách công thức của chính người dùng đang đăng nhập (mọi trạng thái).
        /// </summary>
        [HttpGet("my")]
        [Authorize]
        public async Task<IActionResult> GetMyRecipes()
        {
            var userId = CurrentUserId;
            var recipes = await _context.Recipes
                .Include(r => r.Author)
                .Include(r => r.Steps)
                .Include(r => r.Ingredients)
                .Where(r => r.AuthorId == userId)
                .OrderByDescending(r => r.UpdatedAt ?? r.CreatedAt)
                .ToListAsync();

            return Ok(recipes.Select(MapRecipe));
        }

        /// <summary>
        /// Lấy chi tiết công thức theo slug (dùng cho trang chi tiết public).
        /// </summary>
        [HttpGet("slug/{slug}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetRecipeBySlug(string slug)
        {
            var recipe = await _context.Recipes
                .Include(r => r.Author)
                .Include(r => r.Steps)
                .Include(r => r.Ingredients)
                .FirstOrDefaultAsync(r => r.Slug == slug && r.Status != "Deleted");

            if (recipe == null) return NotFound(new { message = "Không tìm thấy công thức." });

            return Ok(MapRecipe(recipe));
        }

        /// <summary>
        /// Lấy chi tiết công thức theo id (dùng để điền dữ liệu cho trang chỉnh sửa).
        /// </summary>
        [HttpGet("{id:int}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetRecipeById(int id)
        {
            var recipe = await _context.Recipes
                .Include(r => r.Author)
                .Include(r => r.Steps)
                .Include(r => r.Ingredients)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (recipe == null) return NotFound(new { message = "Không tìm thấy công thức." });

            return Ok(MapRecipe(recipe));
        }

        [HttpGet("benchmark")]
        public async Task<IActionResult> BenchmarkRecipes()
        {
            var sw = Stopwatch.StartNew();

            var recipesWithTracking = await _context.Recipes
                .Include(r => r.Steps)
                .Include(r => r.Ingredients)
                .Take(100)
                .ToListAsync();
            long timeWithTracking = sw.ElapsedMilliseconds;

            sw.Restart();
            var recipesNoTracking = await _context.Recipes
                .AsNoTracking()
                .Include(r => r.Steps)
                .Include(r => r.Ingredients)
                .Take(100)
                .ToListAsync();
            long timeNoTracking = sw.ElapsedMilliseconds;

            return Ok(new
            {
                Message = "So sánh thời gian thực thi giữa có và không có AsNoTracking với 100 recipes",
                WithTracking_Ms = timeWithTracking,
                AsNoTracking_Ms = timeNoTracking
            });
        }

        /// <summary>
        /// Tạo công thức mới và upload ảnh (yêu cầu đăng nhập, mặc định trạng thái Draft).
        /// </summary>
        [HttpPost]
        [Authorize]
        [RequestSizeLimit(10_000_000)]
        public async Task<IActionResult> CreateRecipe(
            [FromForm] CreateRecipeDto dto,
            IFormFile? imageFile)
        {
            var (imageUrl, imageError) = await SaveImageAsync(imageFile);
            if (imageError != null) return BadRequest(new { message = imageError });

            var status = NormalizeStatus(dto.Status);
            if (status != "Draft" && status != "Published") status = "Draft";

            var recipe = new Recipe
            {
                Title = dto.Title,
                Description = dto.Description,
                AuthorId = CurrentUserId,
                ImageUrl = imageUrl,
                Slug = dto.Slug,
                PrepTimeMinutes = dto.PrepTimeMinutes,
                CookTimeMinutes = dto.CookTimeMinutes,
                Servings = dto.Servings,
                Difficulty = dto.Difficulty,
                CategoryName = dto.CategoryName,
                Instructions = dto.Instructions,
                Status = status,
                PublishedAt = status == "Published" ? DateTime.UtcNow : null,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                Steps = new List<Step>(),
                Ingredients = new List<Ingredient>()
            };

            _context.Recipes.Add(recipe);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetRecipeById), new { id = recipe.Id }, new
            {
                message = "Tạo công thức thành công!",
                recipeId = recipe.Id,
                status = recipe.Status,
                imageUrl
            });
        }

        /// <summary>
        /// Cập nhật công thức (chỉ chủ sở hữu). Có thể upload ảnh mới để thay ảnh cũ.
        /// </summary>
        [HttpPut("{id:int}")]
        [Authorize]
        [RequestSizeLimit(10_000_000)]
        public async Task<IActionResult> UpdateRecipe(
            int id,
            [FromForm] UpdateRecipeDto dto,
            IFormFile? imageFile)
        {
            var recipe = await _context.Recipes.FirstOrDefaultAsync(r => r.Id == id);
            if (recipe == null) return NotFound(new { message = "Không tìm thấy công thức." });
            if (recipe.AuthorId != CurrentUserId)
                return Forbid();

            var (newImageUrl, imageError) = await SaveImageAsync(imageFile);
            if (imageError != null) return BadRequest(new { message = imageError });

            var oldImageUrl = recipe.ImageUrl;
            if (newImageUrl != null)
            {
                recipe.ImageUrl = newImageUrl;
                if (!string.IsNullOrEmpty(oldImageUrl))
                    await _imageService.DeleteImageAsync(oldImageUrl);
            }

            recipe.Title = dto.Title;
            recipe.Description = dto.Description;
            recipe.Slug = dto.Slug;
            recipe.PrepTimeMinutes = dto.PrepTimeMinutes;
            recipe.CookTimeMinutes = dto.CookTimeMinutes;
            recipe.Servings = dto.Servings;
            recipe.Difficulty = dto.Difficulty;
            recipe.CategoryName = dto.CategoryName;
            recipe.Instructions = dto.Instructions;
            recipe.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Cập nhật công thức thành công!",
                recipeId = recipe.Id,
                imageUrl = recipe.ImageUrl
            });
        }

        /// <summary>
        /// Chuyển trạng thái: Draft -> Published -> Archived/Deleted (chỉ chủ sở hữu).
        /// </summary>
        [HttpPatch("{id:int}/status")]
        [Authorize]
        public async Task<IActionResult> ChangeStatus(int id, [FromBody] ChangeRecipeStatusDto dto)
        {
            var recipe = await _context.Recipes.FirstOrDefaultAsync(r => r.Id == id);
            if (recipe == null) return NotFound(new { message = "Không tìm thấy công thức." });
            if (recipe.AuthorId != CurrentUserId)
                return Forbid();

            var newStatus = NormalizeStatus(dto.Status);
            if (!StatusTransitions.ContainsKey(newStatus))
                return BadRequest(new { message = "Trạng thái không hợp lệ." });

            if (!StatusTransitions.TryGetValue(recipe.Status, out var allowed) || !allowed.Contains(newStatus))
                return BadRequest(new
                {
                    message = $"Không thể chuyển từ trạng thái {recipe.Status} sang {newStatus}.",
                    currentStatus = recipe.Status,
                    allowedStatuses = allowed
                });

            recipe.Status = newStatus;
            recipe.UpdatedAt = DateTime.UtcNow;
            if (newStatus == "Published") recipe.PublishedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = $"Đã chuyển trạng thái sang {newStatus}.",
                recipeId = id,
                status = recipe.Status
            });
        }

        /// <summary>
        /// Xóa mềm công thức (chuyển sang Deleted, chỉ chủ sở hữu).
        /// </summary>
        [HttpDelete("{id:int}")]
        [Authorize]
        public async Task<IActionResult> DeleteRecipe(int id)
        {
            var recipe = await _context.Recipes.FirstOrDefaultAsync(r => r.Id == id);
            if (recipe == null) return NotFound(new { message = "Không tìm thấy công thức." });
            if (recipe.AuthorId != CurrentUserId)
                return Forbid();

            recipe.Status = "Deleted";
            recipe.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã xóa công thức.", recipeId = id, status = recipe.Status });
        }
    }
}
