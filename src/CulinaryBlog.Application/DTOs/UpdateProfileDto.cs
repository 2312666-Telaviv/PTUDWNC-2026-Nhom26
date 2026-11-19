using System.ComponentModel.DataAnnotations;

namespace CulinaryBlog.Application.DTOs
{
    public class UpdateProfileDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
    }
}
