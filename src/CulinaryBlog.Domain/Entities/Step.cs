using System;
using System.Collections.Generic;
using System.Text;

namespace CulinaryBlog.Domain.Entities
{
    public class Step
    {
        public int Id { get; set; }
        public int RecipeId { get; set; }
        public int StepNumber { get; set; }
        public string Instruction { get; set; } = string.Empty;

        // Navigation property ngược lại về Recipe
        public virtual Recipe? Recipe { get; set; }
    }
}