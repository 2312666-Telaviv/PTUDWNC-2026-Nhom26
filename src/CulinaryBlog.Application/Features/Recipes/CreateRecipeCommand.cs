using CulinaryBlog.Domain.Entities;

namespace CulinaryBlog.Application.Features.Recipes
{
    public class CreateRecipeCommand
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string AuthorId { get; set; } = string.Empty;

        public List<StepDto> Steps { get; set; } = new();
        public List<IngredientDto> Ingredients { get; set; } = new();
    }

    public class StepDto
    {
        public int StepNumber { get; set; }
        public string Instruction { get; set; } = string.Empty;
    }

    public class IngredientDto
    {
        public string Name { get; set; } = string.Empty;
        public string Quantity { get; set; } = string.Empty;
    }
}