using CulinaryBlog.Application.Contracts;
using CulinaryBlog.Domain.Entities;

namespace CulinaryBlog.Application.Features.Recipes
{
    public class CreateRecipeCommandHandler
    {
        private readonly IUnitOfWork _unitOfWork;

        // Inject IUnitOfWork (không dùng DbContext nữa)
        public CreateRecipeCommandHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<int> Handle(CreateRecipeCommand command)
        {
            // 1. Tạo Recipe
            var recipe = new Recipe
            {
                Title = command.Title,
                Description = command.Description,
                AuthorId = command.AuthorId,
                Steps = new List<Step>(),
                Ingredients = new List<Ingredient>()
            };

            // 2. Thêm Steps
            foreach (var s in command.Steps)
            {
                recipe.Steps.Add(new Step
                {
                    StepNumber = s.StepNumber,
                    Instruction = s.Instruction
                });
            }

            // 3. Thêm Ingredients
            foreach (var i in command.Ingredients)
            {
                recipe.Ingredients.Add(new Ingredient
                {
                    Name = i.Name,
                    Quantity = i.Quantity
                });
            }

            // 4. Dùng UnitOfWork để lưu
            await _unitOfWork.AddRecipeAsync(recipe);
            await _unitOfWork.SaveChangesAsync();

            return recipe.Id;
        }
    }
}