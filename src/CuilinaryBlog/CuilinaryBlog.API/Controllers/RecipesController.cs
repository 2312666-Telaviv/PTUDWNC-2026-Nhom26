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
        private readonly ApplicationDbContext _context;

        public RecipesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetRecipes([FromQuery] string mode = "split")
        {
            // 1. Bắt đầu đo thời gian
            var stopwatch = Stopwatch.StartNew();

            List<Recipe> recipes;

            // 2. Truy vấn dữ liệu kèm theo author, steps, ingredients
            var query = _context.Recipes
                .Include(r => r.Author)
                .Include(r => r.Steps)
                .Include(r => r.Ingredients);

            // 3. So sánh giữa 2 cách: Dùng AsSplitQuery (tối ưu cho quan hệ 1-nhiều) hoặc Single Query thông thường
            if (mode.ToLower() == "split")
            {
                recipes = await query.AsSplitQuery().ToListAsync();
            }
            else
            {
                recipes = await query.ToListAsync();
            }

            stopwatch.Stop();

            // Trả về kết quả kèm thời gian xử lý để kiểm chứng
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