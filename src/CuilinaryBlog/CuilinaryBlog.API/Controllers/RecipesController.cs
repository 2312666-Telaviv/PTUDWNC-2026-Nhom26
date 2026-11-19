using Asp.Versioning;
using CulinaryBlog.Application.DTOs;
using CulinaryBlog.Application.Features.Recipes;
using CulinaryBlog.Application.Services;
using CulinaryBlog.Domain.Entities;
using CulinaryBlog.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Primitives;
using System.Diagnostics;
using System.Security.Claims;
using System.Text.Json;

namespace CulinaryBlog.API.Controllers
{
    /// <summary>
    /// Quản lý công thức nấu ăn.
    /// </summary>
    [ApiController]
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/recipes")]
    public class RecipesController : ControllerBase
    {
        private static readonly JsonSerializerOptions JsonOptions = new()
        {
            PropertyNameCaseInsensitive = true
        };

        private readonly CreateRecipeCommandHandler _handler;
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

        public RecipesController(
            CreateRecipeCommandHandler handler,
            ApplicationDbContext context,
            IImageService imageService)
        {
            _handler = handler;
            _context = context;
            _imageService = imageService;
        }

        private string? GetCurrentUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("sub")?.Value
                ?? User.FindFirst(ClaimTypes.Name)?.Value;
        }

        private string CurrentUserId => GetCurrentUserId() ?? string.Empty;

        private bool CanModify(Recipe recipe)
        {
            return User.IsInRole("Admin")
                || string.Equals(recipe.AuthorId, GetCurrentUserId(), StringComparison.Ordinal);
        }

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
        /// Tạo công thức mới. AuthorId được lấy từ JWT, không lấy từ body, và có thể upload ảnh.
        /// </summary>
        [HttpPost]
        [Authorize]
        [RequestSizeLimit(10_000_000)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> CreateRecipe()
        {
            var userId = GetCurrentUserId();
            if (userId is null)
            {
                return Unauthorized();
            }

            CreateRecipeDto dto;
            CreateRecipeCommand command;
            IFormFile? imageFile = null;
            var isFormRequest = Request.HasFormContentType;

            if (isFormRequest)
            {
                var form = await Request.ReadFormAsync();
                dto = ReadRecipeDto<CreateRecipeDto>(form);
                if (!TryValidateModel(dto))
                {
                    return BadRequest(ModelState);
                }

                imageFile = form.Files.GetFile("imageFile");
                command = new CreateRecipeCommand
                {
                    Title = dto.Title,
                    Description = dto.Description,
                    AuthorId = userId,
                    Steps = ReadSteps(form),
                    Ingredients = ReadIngredients(form)
                };
            }
            else
            {
                command = await JsonSerializer.DeserializeAsync<CreateRecipeCommand>(Request.Body, JsonOptions)
                          ?? new CreateRecipeCommand();
                command.AuthorId = userId;
                dto = new CreateRecipeDto
                {
                    Title = command.Title,
                    Description = command.Description,
                    Status = "Draft"
                };
            }

            var (imageUrl, imageError) = await SaveImageAsync(imageFile);
            if (imageError != null) return BadRequest(new { message = imageError });

            var status = NormalizeStatus(dto.Status);
            if (status != "Draft" && status != "Published") status = "Draft";

            var recipeId = await _handler.Handle(command);

            var recipe = await _context.Recipes.FindAsync(recipeId);
            if (recipe != null)
            {
                recipe.Slug = dto.Slug;
                recipe.PrepTimeMinutes = dto.PrepTimeMinutes;
                recipe.CookTimeMinutes = dto.CookTimeMinutes;
                recipe.Servings = dto.Servings;
                recipe.Difficulty = dto.Difficulty;
                recipe.CategoryName = dto.CategoryName;
                recipe.Instructions = dto.Instructions;
                recipe.ImageUrl = imageUrl;
                recipe.Status = status;
                recipe.PublishedAt = status == "Published" ? DateTime.UtcNow : null;
                recipe.CreatedAt = DateTime.UtcNow;
                recipe.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }

            return Ok(new
            {
                id = recipeId,
                recipeId,
                title = command.Title,
                message = "Tạo thành công!",
                status,
                imageUrl
            });
        }

        /// <summary>
        /// Lấy danh sách công thức (có phân trang, lọc theo trạng thái) + thông tin benchmark.
        /// </summary>
        [HttpGet]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
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

        /// <summary>
        /// So sánh hiệu năng query có và không có AsNoTracking.
        /// </summary>
        [HttpGet("benchmark")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> BenchmarkRecipes()
        {
            var sw = Stopwatch.StartNew();

            // 1. Query CO Tracking (mặc định)
            sw.Restart();
            var recipesWithTracking = await _context.Recipes
                .Include(r => r.Steps)
                .Include(r => r.Ingredients)
                .Take(100)
                .ToListAsync();
            long timeWithTracking = sw.ElapsedMilliseconds;

            // 2. Query KHONG CO AsNoTracking
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
        /// Cập nhật công thức. Chỉ chủ bài viết hoặc Admin được phép, có thể upload ảnh mới.
        /// </summary>
        [HttpPut("{id:int}")]
        [Authorize]
        [RequestSizeLimit(10_000_000)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateRecipe(int id)
        {
            var recipe = await _context.Recipes
                .Include(r => r.Steps)
                .Include(r => r.Ingredients)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (recipe is null)
            {
                return NotFound(new { message = $"Không tìm thấy công thức có id = {id}." });
            }

            if (!CanModify(recipe))
            {
                return Forbid();
            }

            UpdateRecipeDto dto;
            CreateRecipeCommand command;
            IFormFile? imageFile = null;
            var isFormRequest = Request.HasFormContentType;
            var hasCollectionData = false;

            if (isFormRequest)
            {
                var form = await Request.ReadFormAsync();
                dto = ReadRecipeDto<UpdateRecipeDto>(form);
                if (!TryValidateModel(dto))
                {
                    return BadRequest(ModelState);
                }

                imageFile = form.Files.GetFile("imageFile");
                hasCollectionData = HasCollectionData(form);
                command = new CreateRecipeCommand
                {
                    Title = dto.Title,
                    Description = dto.Description,
                    Steps = ReadSteps(form),
                    Ingredients = ReadIngredients(form)
                };
            }
            else
            {
                command = await JsonSerializer.DeserializeAsync<CreateRecipeCommand>(Request.Body, JsonOptions)
                          ?? new CreateRecipeCommand();
                dto = new UpdateRecipeDto
                {
                    Title = command.Title,
                    Description = command.Description
                };
            }

            var (newImageUrl, imageError) = await SaveImageAsync(imageFile);
            if (imageError != null) return BadRequest(new { message = imageError });

            var oldImageUrl = recipe.ImageUrl;
            if (newImageUrl != null)
            {
                recipe.ImageUrl = newImageUrl;
                if (!string.IsNullOrEmpty(oldImageUrl))
                    await _imageService.DeleteImageAsync(oldImageUrl);
            }

            recipe.Title = command.Title;
            recipe.Description = command.Description;

            if (isFormRequest)
            {
                recipe.Slug = dto.Slug;
                recipe.PrepTimeMinutes = dto.PrepTimeMinutes;
                recipe.CookTimeMinutes = dto.CookTimeMinutes;
                recipe.Servings = dto.Servings;
                recipe.Difficulty = dto.Difficulty;
                recipe.CategoryName = dto.CategoryName;
                recipe.Instructions = dto.Instructions;
            }

            if (!isFormRequest || hasCollectionData)
            {
                _context.Set<Step>().RemoveRange(recipe.Steps);
                _context.Set<Ingredient>().RemoveRange(recipe.Ingredients);

                recipe.Steps = command.Steps
                    .Select(s => new Step { StepNumber = s.StepNumber, Instruction = s.Instruction })
                    .ToList();
                recipe.Ingredients = command.Ingredients
                    .Select(i => new Ingredient { Name = i.Name, Quantity = i.Quantity })
                    .ToList();
            }

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
        /// Chuyển trạng thái: Draft -> Published -> Archived/Deleted (chỉ chủ sở hữu hoặc Admin).
        /// </summary>
        [HttpPatch("{id:int}/status")]
        [Authorize]
        public async Task<IActionResult> ChangeStatus(int id, [FromBody] ChangeRecipeStatusDto dto)
        {
            var recipe = await _context.Recipes.FirstOrDefaultAsync(r => r.Id == id);
            if (recipe == null) return NotFound(new { message = "Không tìm thấy công thức." });
            if (!CanModify(recipe)) return Forbid();

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
        /// Xóa mềm công thức (chuyển sang Deleted, chỉ chủ sở hữu hoặc Admin được phép).
        /// </summary>
        [HttpDelete("{id:int}")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteRecipe(int id)
        {
            var recipe = await _context.Recipes.FirstOrDefaultAsync(r => r.Id == id);
            if (recipe is null)
            {
                return NotFound(new { message = $"Không tìm thấy công thức có id = {id}." });
            }

            if (!CanModify(recipe))
            {
                return Forbid();
            }

            recipe.Status = "Deleted";
            recipe.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã xóa công thức.", recipeId = id, status = recipe.Status });
        }

        private static T ReadRecipeDto<T>(IFormCollection form) where T : CreateRecipeDto, new()
        {
            return new T
            {
                Title = form["Title"].ToString(),
                Description = form["Description"].ToString(),
                Slug = form["Slug"].ToString(),
                PrepTimeMinutes = ParseInt(form["PrepTimeMinutes"]),
                CookTimeMinutes = ParseInt(form["CookTimeMinutes"]),
                Servings = ParseInt(form["Servings"]),
                Difficulty = string.IsNullOrWhiteSpace(form["Difficulty"]) ? "Easy" : form["Difficulty"].ToString(),
                CategoryName = form["CategoryName"].ToString(),
                Instructions = form["Instructions"].ToString(),
                Status = string.IsNullOrWhiteSpace(form["Status"]) ? "Draft" : form["Status"].ToString(),
                ImageUrl = string.IsNullOrWhiteSpace(form["ImageUrl"]) ? null : form["ImageUrl"].ToString()
            };
        }

        private static int ParseInt(StringValues value)
        {
            return int.TryParse(value.ToString(), out var result) ? result : 0;
        }

        private static List<StepDto> ReadSteps(IFormCollection form)
        {
            var steps = new List<StepDto>();

            for (var i = 0; ; i++)
            {
                var numberKey = $"Steps[{i}].StepNumber";
                var instructionKey = $"Steps[{i}].Instruction";
                if (!form.ContainsKey(numberKey) && !form.ContainsKey(instructionKey))
                {
                    break;
                }

                var stepNumber = ParseInt(form[numberKey]);
                steps.Add(new StepDto
                {
                    StepNumber = stepNumber == 0 ? i + 1 : stepNumber,
                    Instruction = form[instructionKey].ToString()
                });
            }

            if (steps.Count == 0 && form.TryGetValue("steps", out var stepsJson))
            {
                steps = JsonSerializer.Deserialize<List<StepDto>>(stepsJson.ToString(), JsonOptions) ?? new List<StepDto>();
            }

            return steps;
        }

        private static List<IngredientDto> ReadIngredients(IFormCollection form)
        {
            var ingredients = new List<IngredientDto>();

            for (var i = 0; ; i++)
            {
                var nameKey = $"Ingredients[{i}].Name";
                var quantityKey = $"Ingredients[{i}].Quantity";
                if (!form.ContainsKey(nameKey) && !form.ContainsKey(quantityKey))
                {
                    break;
                }

                ingredients.Add(new IngredientDto
                {
                    Name = form[nameKey].ToString(),
                    Quantity = form[quantityKey].ToString()
                });
            }

            if (ingredients.Count == 0 && form.TryGetValue("ingredients", out var ingredientsJson))
            {
                ingredients = JsonSerializer.Deserialize<List<IngredientDto>>(ingredientsJson.ToString(), JsonOptions)
                              ?? new List<IngredientDto>();
            }

            return ingredients;
        }

        private static bool HasCollectionData(IFormCollection form)
        {
            return form.Any(pair =>
                       pair.Key.StartsWith("Steps[", StringComparison.OrdinalIgnoreCase)
                       || pair.Key.StartsWith("Ingredients[", StringComparison.OrdinalIgnoreCase))
                   || form.ContainsKey("steps")
                   || form.ContainsKey("ingredients");
        }
    }
}
