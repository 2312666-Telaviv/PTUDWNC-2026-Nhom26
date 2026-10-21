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

# Phân công Lab 5

**Nội dung Lab 5:**  
Bảo mật (CORS, Rate Limiting, Authentication/Authorization), sinh tài liệu đặc tả API & API versioning, xây dựng cấu trúc dự án front-end, cài đặt thư viện và TypeScript types.

| Phần | Nội dung | Thành viên | MSSV | Nhánh |
|------|----------|------------|------|-------|
| 1 | Bảo mật back-end: CORS, Rate Limiting, JWT, phân quyền theo role và chủ sở hữu | Kieu Ha Linh | 2312665 | `2312665-KieuHaLinh` |
| 2 | Tài liệu API: Swagger/OpenAPI, API versioning `/api/v1`, xử lý cảnh báo AV0029/AV0030 | Kieu Ha Linh | 2312665 | `2312665-KieuHaLinh` |
| 3 | Front-end Next.js: cài đặt môi trường, xây dựng cấu trúc dự án | Kieu Hoang Linh | 2312666 | `2312666-KieuHoangLinh` |
| 4 | Cài đặt các thư viện cần thiết cho front-end | Nguyen Tran Quynh Huong | 2312631 | `2312631-NguyenTranQuynhHuong` |
| 5 | Cài đặt các kiểu dữ liệu (TS types) cần thiết cho ứng dụng front-end | Nguyen Tran Quynh Huong | 2312631 | `2312631-NguyenTranQuynhHuong` |

---

### Chi tiết công việc

**Phần 1 & 2 – Kieu Ha Linh (MSSV: 2312665)**
- Cấu hình CORS theo origin của front-end (đọc từ `appsettings`).
- Rate Limiting: policy mặc định và policy chặt hơn cho đăng nhập/đăng ký, trả 429 kèm `Retry-After`.
- Authentication (JWT) và Authorization (role Admin/User, owner-or-admin cho công thức).
- Chuyển mật khẩu tài khoản admin seed ra khỏi code (cấu hình hoặc user-secrets).
- Cấu hình Swagger/OpenAPI có nút Authorize (Bearer), mô tả endpoint và response code.
- API versioning `/api/v1`, xử lý cảnh báo AV0029/AV0030.
- Sản phẩm: bảng kiểm thử 401/403/429, CORS và ảnh minh chứng + tài liệu Swagger.

**Phần 3 – Kieu Hoang Linh (MSSV: 2312666)**
- Cài đặt môi trường phát triển front-end (Node.js, Next.js…).
- Xây dựng cấu trúc thư mục dự án phía front-end.
- Sản phẩm: cấu trúc project rõ ràng, có thể chạy được môi trường cơ bản.

**Phần 4 & 5 – Nguyen Tran Quynh Huong (MSSV: 2312631)**
- Cài đặt các thư viện cần thiết cho ứng dụng front-end.
- Định nghĩa và cài đặt các TypeScript types cần dùng trong ứng dụng.
- Sản phẩm: `package.json` đầy đủ thư viện + file types tương ứng.

## Phân công Lab 6

**Nội dung Lab 6:** Cài đặt lớp tiện ích (xử lý lỗi, gọi API…), cài đặt thư viện UI (shadcn/ui hoặc tương đương), cài đặt store quản lý trạng thái, thiết kế giao diện tĩnh cho blog app, xây dựng các component dùng chung và layout chung.

| Phần | Nội dung | Thành viên | MSSV | Nhánh |
|------|----------|------------|------|-------|
| 1 & 2 | Lớp tiện ích (error handling, API client…) + Cài đặt shadcn/ui (hoặc thư viện UI khác) | Kieu Ha Linh | 2312665 | 2312665-KieuHaLinh |
| 3 & 4 | Cài đặt store quản lý trạng thái (auth-store.ts…) + Thiết kế giao diện tĩnh cho blog app | Kieu Hoang Linh | 2312666 | 2312666-KieuHoangLinh |
| 5 & 6 | Xây dựng các component dùng chung (Header, Footer, Pagination, Loading, Error…) + Xây dựng layout chung cho blog app | Nguyen Tran Quynh Huong | 2312631 | 2312631-NguyenTranQuynhHuong |

### Phần 1 & 2 – Kieu Ha Linh (MSSV: 2312665)

- Cài đặt các lớp tiện ích xử lý lỗi, gọi API, format dữ liệu…
- Cài đặt gói thư viện **shadcn/ui** (hoặc thư viện hỗ trợ thiết kế giao diện khác).
- Sản phẩm: code tiện ích + cấu hình shadcn/ui hoàn chỉnh, có thể import và sử dụng component UI.

### Phần 3 & 4 – Kieu Hoang Linh (MSSV: 2312666)

- Cài đặt store quản lý trạng thái (ví dụ: `auth-store.ts` với Zustand hoặc tương đương).
- Thiết kế giao diện **tĩnh** cho blog app (các trang/màn hình chính theo mockup).
- Sản phẩm: store hoạt động, giao diện tĩnh hiển thị đúng layout và style.

### Phần 5 & 6 – Nguyen Tran Quynh Huong (MSSV: 2312631)

- Xây dựng các component dùng chung: Header, Footer, Pagination, Loading, Error…
- Xây dựng bố cục (layout) chung cho toàn bộ blog app.
- Sản phẩm: component tái sử dụng được + layout chung áp dụng cho các trang.

## Quy ước làm việc

- Mỗi thành viên làm trên nhánh riêng, mở Pull Request vào `main`.
- Báo cáo cá nhân nộp LMS theo tên file `Lab6_MSSV_HoVaTen.docx`.
## Quy ước làm việc

- Mỗi thành viên làm trên nhánh riêng, mở Pull Request vào `main`.
- Báo cáo cá nhân nộp LMS theo tên file `LabX_MSSV_HoVaTen.docx`.
