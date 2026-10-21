using Asp.Versioning;
using CulinaryBlog.Application.Features.Recipes;
using CulinaryBlog.Domain.Entities;
using CulinaryBlog.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;
using System.Security.Claims;

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
        private readonly CreateRecipeCommandHandler _handler;
        private readonly ApplicationDbContext _context;

        public RecipesController(
            CreateRecipeCommandHandler handler,
            ApplicationDbContext context)
        {
            _handler = handler;
            _context = context;
        }

        /// <summary>
        /// Tạo công thức mới. AuthorId được lấy từ JWT, không lấy từ body.
        /// </summary>
        [HttpPost]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> CreateRecipe([FromBody] CreateRecipeCommand command)
        {
            var userId = GetCurrentUserId();
            if (userId is null)
            {
                return Unauthorized();
            }

            command.AuthorId = userId;
            var recipeId = await _handler.Handle(command);
            return Ok(new { id = recipeId, recipeId, title = command.Title, message = "Tạo thành công!" });
        }

        /// <summary>
        /// Lấy danh sách công thức (công khai).
        /// </summary>
        [HttpGet]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetRecipes([FromQuery] string mode = "split")
        {
            var stopwatch = Stopwatch.StartNew();

            var query = _context.Recipes
                .Include(r => r.Author)
                .Include(r => r.Steps)
                .Include(r => r.Ingredients)
                .Select(r => new
                {
                    r.Id,
                    r.Title,
                    r.Description,
                    r.AuthorId,
                    Author = new
                    {
                        r.Author.Id,
                        r.Author.UserName,
                        r.Author.Email
                    },
                    Steps = r.Steps
                        .OrderBy(s => s.StepNumber)
                        .Select(s => new { s.Id, s.StepNumber, s.Instruction })
                        .ToList(),
                    Ingredients = r.Ingredients
                        .Select(i => new { i.Id, i.Name, i.Quantity })
                        .ToList()
                });

            var recipes = mode.Equals("split", StringComparison.OrdinalIgnoreCase)
                ? await query.AsSplitQuery().ToListAsync()
                : await query.ToListAsync();

            stopwatch.Stop();

            return Ok(new
            {
                ExecutionTimeMs = stopwatch.ElapsedMilliseconds,
                Mode = mode,
                TotalRecipes = recipes.Count,
                Data = recipes
            });
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
        /// Cập nhật công thức. Chỉ chủ bài viết hoặc Admin được phép.
        /// </summary>
        [HttpPut("{id:int}")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateRecipe(int id, [FromBody] CreateRecipeCommand command)
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

            recipe.Title = command.Title;
            recipe.Description = command.Description;

            _context.Set<Step>().RemoveRange(recipe.Steps);
            _context.Set<Ingredient>().RemoveRange(recipe.Ingredients);

            recipe.Steps = command.Steps
                .Select(s => new Step { StepNumber = s.StepNumber, Instruction = s.Instruction })
                .ToList();
            recipe.Ingredients = command.Ingredients
                .Select(i => new Ingredient { Name = i.Name, Quantity = i.Quantity })
                .ToList();

            await _context.SaveChangesAsync();
            return NoContent();
        }

        /// <summary>
        /// Xóa công thức. Chỉ chủ bài viết hoặc Admin được phép.
        /// </summary>
        [HttpDelete("{id:int}")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
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

            _context.Recipes.Remove(recipe);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private string? GetCurrentUserId()
        {
            return User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue(ClaimTypes.Name);
        }

        private bool CanModify(Recipe recipe)
        {
            return User.IsInRole("Admin")
                || string.Equals(recipe.AuthorId, GetCurrentUserId(), StringComparison.Ordinal);
        }
    }
}
