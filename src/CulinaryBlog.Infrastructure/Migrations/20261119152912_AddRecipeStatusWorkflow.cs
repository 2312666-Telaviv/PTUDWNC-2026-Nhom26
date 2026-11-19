using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CulinaryBlog.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddRecipeStatusWorkflow : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "PublishedAt",
                table: "Recipes",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Recipes",
                type: "text",
                nullable: false,
                defaultValue: "Draft");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Recipes",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PublishedAt",
                table: "Recipes");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Recipes");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Recipes");
        }
    }
}
