using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Asp.Versioning;

namespace CuilinaryBlog.API.Controllers
{
<<<<<<< HEAD
    /// <summary>
    /// Endpoint mẫu thời tiết (công khai).
    /// </summary>
=======
    [ApiVersion("1.0")]
>>>>>>> origin/2312665-KieuHaLinh
    [ApiController]
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/[controller]")]
    public class WeatherForecastController : ControllerBase
    {
        private static readonly string[] Summaries =
        [
            "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
        ];

        /// <summary>
        /// Lấy dữ liệu thời tiết mẫu.
        /// </summary>
        [HttpGet(Name = "GetWeatherForecast")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public IEnumerable<WeatherForecast> Get()
        {
            return Enumerable.Range(1, 5).Select(index => new WeatherForecast
            {
                Date = DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
                TemperatureC = Random.Shared.Next(-20, 55),
                Summary = Summaries[Random.Shared.Next(Summaries.Length)]
            })
            .ToArray();
        }
    }
}
