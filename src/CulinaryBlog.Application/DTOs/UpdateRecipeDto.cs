using System.ComponentModel.DataAnnotations;

namespace CulinaryBlog.Application.DTOs
{
    /// <summary>
    /// Dữ liệu cập nhật công thức. Kế thừa toàn bộ field của CreateRecipeDto
    /// nên có thể dùng chung luồng validate khi thêm mới và chỉnh sửa.
    /// </summary>
    public class UpdateRecipeDto : CreateRecipeDto
    {
    }
}
