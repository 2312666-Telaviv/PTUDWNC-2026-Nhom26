using System;
using System.Collections.Generic;
using System.Text;

namespace CulinaryBlog.Domain.Entities
{
    public class Ingredient
    {
        public int Id { get; set; }
        public int RecipeId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Quantity { get; set; } = string.Empty; // Ví dụ: "100g", "2 muỗng", v.v.

        // Navigation property ngược lại về Recipe
        public virtual Recipe? Recipe { get; set; }
    }
}