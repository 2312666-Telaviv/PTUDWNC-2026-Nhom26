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
    }
}