# PTUDWNC-2026-Nhom26

Đồ án môn Phát triển ứng dụng Web nâng cao - Culinary Blog.

## Thành viên

| Họ tên | MSSV | Nhánh |
|---|---|---|
| Kieu Hoang Linh | 2312666 | `2312666-KieuHoangLinh` |
| Kieu Ha Linh | 2312665 | `2312665-KieuHaLinh` |
| Nguyen Tran Quynh Huong | 2312631 | `2312631-NguyenTranQuynhHuong` |

## Phân công Lab 3 - Thiết kế Dữ liệu và Tối ưu Truy vấn

Mã nguồn nằm trong thư mục `src` (Domain, Application, Infrastructure, API).

### Nguyễn Trần Quỳnh Hương
- [ ] [Repo] Implement `IRepository<T>`, `IUnitOfWork`, `Repository<T>`, `UnitOfWork` theo code mẫu
- [ ] [EF] Viết `IEntityTypeConfiguration` cho `RecipeStep` và `RecipeIngredient`
- [ ] [Search] `SearchRecipesQuery` và handler dùng `EF.Functions.PlainToTsQuery()`
- [ ] [Test] Full-Text Search: "pho bo" tìm được "Phở bò", giải thích vai trò của `unaccent()`

### Nguyễn Hữu Nhật Nguyên
- [ ] [Migration] Tạo và apply `InitialCreate`, kiểm tra schema trong pgAdmin
- [ ] [CQRS] `CreateRecipeCommandHandler` dùng `IUnitOfWork` (không dùng `IApplicationDbContext`)
- [ ] [Migration] Bổ sung `SearchVector` computed column và GIN index
- [ ] [Migration] Full-Text Search cho `Instructions`, cập nhật `RecipeConfiguration`

### Kiều Hoàng Linh
- [ ] [Test] Tạo recipe 3 steps + 5 ingredients qua Scalar, verify DB bằng pgAdmin
- [ ] [Logging] Bật SQL logging trong Development, quan sát `Include` ở `GET /api/v1/recipes`
- [ ] [Seed] Mở rộng `CulinaryBlogSeeder`: thêm 10 comments cho mỗi recipe

### Kiều Hà Linh
- [ ] [API] `GET /api/v1/recipes/{id}` trả `RecipeDetailDto`, dùng `AsSplitQuery` + `Include`
- [ ] [Performance] So sánh `AsNoTracking()` với 100 recipes, ghi lại kết quả
- [ ] [Query] `ProjectToType<RecipeListDto>()` trong `GetRecipesQueryHandler`
- [ ] [Performance] `EXPLAIN ANALYZE` cho GetAll, GetById, GetByCategory
## Phân công Lab 4 - Kiến trúc Frontend hiện đại với Next.js

Mã nguồn nằm trong thư mục `culinary-blog-web`.

### Bài 1 - App Router Setup và Rendering Strategies
**Người thực hiện:** Nguyen Tran Quynh Huong (2312631)
- Khởi tạo `culinary-blog-web` bằng create-next-app, cấu hình Route Groups, cài dependencies.
- Trang `/recipes` (ISR, revalidate 1 giờ) hiển thị danh sách recipes dạng grid.
- Trang `/recipes/[slug]` (SSR) hiển thị chi tiết recipe, có `loading.tsx` skeleton.
- Cấu hình `next.config.ts` cho remote images từ API server.
- Thêm `generateMetadata()` cho trang chi tiết với Open Graph tags.

### Bài 2 - TanStack Query và Auth.js
**Phần A - TanStack Query:** Kieu Hoang Linh (2312666)
- Setup Providers (QueryClientProvider + SessionProvider), cấu hình QueryClient defaults.
- Axios instance với request interceptor (gắn JWT) và response interceptor (xử lý 401).
- Custom hooks: `useRecipes()`, `useRecipe(slug)`, `useInfiniteComments(recipeId)`.

**Phần B - Auth.js:** Kieu Ha Linh (2312665)
- Setup Auth.js v5 với Credentials Provider kết nối .NET API (Chương 2).
- Cấu hình `middleware.ts` bảo vệ `/dashboard` và `/recipes/new`.

### Bài 3 - Forms, Zustand và Tích hợp đầy đủ
**Người thực hiện:** Kieu Hoang Linh (2312666)
- `CreateRecipeForm` với Zod schema, dynamic field arrays (steps, ingredients), thông báo lỗi tiếng Việt.
- `useLikeRecipe()` với Optimistic Updates.
- `useUIStore` (Zustand): `recipesViewMode` (grid/list, persist) và modal system.
- Tích hợp Social Login với Google vào Auth.js.
- Performance audit bằng Next.js Bundle Analyzer.

## Phân công Lab 5

**Nội dung Lab 5:** bảo mật (CORS, Rate Limiting, Authentication/Authorization), sinh tài liệu đặc tả API và API versioning, xây dựng cấu trúc dự án front-end, cài đặt thư viện, TS types.

| Phần | Nội dung | Thành viên | MSSV | Nhánh |
|---|---|---|---|---|
| 1 | Bảo mật back-end: CORS, Rate Limiting, JWT, phân quyền theo role và chủ sở hữu | Kieu Hoang Linh | 2312666 | `2312666-KieuHoangLinh` |
| 2 | Tài liệu API: Swagger/OpenAPI, API versioning `/api/v1`, xử lý cảnh báo AV0029/AV0030 | Kieu Ha Linh | 2312665 | `2312665-KieuHaLinh` |
| 3 | Front-end Next.js: môi trường, cấu trúc dự án, thư viện, TS types, lớp gọi API | Nguyen Tran Quynh Huong | 2312631 | `2312631-NguyenTranQuynhHuong` |

### Phần 1 - Bảo mật back-end
- Cấu hình CORS theo origin của front-end (đọc từ `appsettings`).
- Rate Limiting: policy mặc định và policy chặt hơn cho đăng nhập/đăng ký, trả 429 kèm `Retry-After`.
- Authentication (JWT) và Authorization (role Admin/User, owner-or-admin cho công thức).
- Chuyển mật khẩu tài khoản admin seed ra khỏi code (cấu hình hoặc user-secrets).
- Sản phẩm: bảng kiểm thử 401/403/429, CORS và ảnh minh chứng.

### Phần 2 - Tài liệu API và versioning
- Cấu hình Swagger/OpenAPI có nút Authorize (Bearer), mô tả endpoint và response code.
- API versioning theo URL (`/api/v1`), header `api-supported-versions`.
- Xử lý 3 cảnh báo AV0029/AV0030 (dùng song song Swashbuckle và OpenAPI built-in).
- Sản phẩm: ảnh Swagger, mô tả cách thêm version v2.

### Phần 3 - Front-end
- Môi trường, `.env.example`, scripts, cấu trúc thư mục `culinary-blog-web`.
- Thư viện cần thiết và TS types khớp DTO của API (không dùng `any`).
- Lớp gọi API dùng `/api/v1`, gắn Bearer, xử lý lỗi 401/403/429.
- Sản phẩm: `typecheck`, `lint`, `build` đạt, ảnh chạy thực tế.

## Quy ước làm việc

- Mỗi thành viên làm trên nhánh riêng, mở Pull Request vào `main`.
- Báo cáo cá nhân nộp LMS theo tên file `LabX_MSSV_HoVaTen.docx`.
