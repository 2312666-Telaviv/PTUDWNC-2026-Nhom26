# PTUDWNC-2026-Nhom26


## 📋 Phân công task lab 03

| Thành viên                  | Task chính                                                                 | Gợi ý Issue / Card |
|-----------------------------|----------------------------------------------------------------------------|--------------------|
| **Nguyễn Trần Quỳnh Hương** | • Implement `IRepository<T>`, `IUnitOfWork`, `Repository<T>`, `UnitOfWork`<br>• Viết `IEntityTypeConfiguration` cho `RecipeStep` & `RecipeIngredient` (constraints, indexes, relationships) | `[Repo] Implement IRepository + UnitOfWork`<br>`[EF] Config RecipeStep & RecipeIngredient` |
| **Nguyễn Hữu Nhật Nguyên**  | • Tạo + apply migration `InitialCreate`, kiểm tra schema trong pgAdmin<br>• Viết `CreateRecipeCommandHandler` dùng `IUnitOfWork` (không dùng `IApplicationDbContext`) | `[Migration] InitialCreate + kiểm tra schema`<br>`[CQRS] CreateRecipeCommandHandler với UnitOfWork` |
| **Kiều Hoàng Linh**         | • Test bằng Scalar: tạo recipe 3 steps + 5 ingredients, verify DB qua pgAdmin<br>• Bật SQL logging (Development) và quan sát queries khi gọi `GET /api/v1/recipes` | `[Test] Tạo recipe 3 steps + 5 ingredients qua Scalar`<br>`[Logging] Bật SQL logging & quan sát Include` |
| **Kiều Hà Linh**            | • Tạo endpoint `GET /api/v1/recipes/{id}` trả về `RecipeDetailDto` đầy đủ (category, author, steps, ingredients) – dùng `AsSplitQuery` + `Include`<br>• So sánh thời gian thực thi (ms) giữa có / không `AsNoTracking()` với 100 recipes | `[API] GET /api/v1/recipes/{id} - RecipeDetailDto`<br>`[Performance] So sánh AsNoTracking với 100 recipes` |
