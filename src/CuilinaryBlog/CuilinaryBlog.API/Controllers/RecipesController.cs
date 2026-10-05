using CulinaryBlog.Application.Features.Recipes;
using CulinaryBlog.Domain.Entities;
using CulinaryBlog.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;

namespace CulinaryBlog.API.Controllers
{
    [Route("api/v1/recipes")]
    [ApiController]
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

        // ===== POST tạo recipe (dùng Handler + UnitOfWork) =====
        [HttpPost]
        public async Task<IActionResult> CreateRecipe([FromBody] CreateRecipeCommand command)
        {
            var recipeId = await _handler.Handle(command);
            return Ok(new { Message = "Tạo thành công!", RecipeId = recipeId });
        }

        // ===== GET danh sách (giữ lại để làm câu Query Optimization) =====
        [HttpGet]
        public async Task<IActionResult> GetRecipes([FromQuery] string mode = "split")
        {
            var stopwatch = Stopwatch.StartNew();

            var query = _context.Recipes
                .Include(r => r.Author)
                .Include(r => r.Steps)
                .Include(r => r.Ingredients);

            List<Recipe> recipes;

            if (mode.ToLower() == "split")
                recipes = await query.AsSplitQuery().ToListAsync();
            else
                recipes = await query.ToListAsync();

            stopwatch.Stop();

            return Ok(new
            {
                ExecutionTimeMs = stopwatch.ElapsedMilliseconds,
                Mode = mode,
                TotalRecipes = recipes.Count,
                Data = recipes
            });
        }


        [HttpGet("benchmark")]
        public async Task<IActionResult> BenchmarkRecipes()
        {
            var sw = Stopwatch.StartNew();

            // 1. Query CÓ Tracking (Mặc định)
            sw.Restart();
            var recipesWithTracking = await _context.Recipes
                .Include(r => r.Steps)
                .Include(r => r.Ingredients)
                .Take(100)
                .ToListAsync();
            long timeWithTracking = sw.ElapsedMilliseconds;

            // 2. Query KHÔNG CÓ AsNoTracking
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
    }
}