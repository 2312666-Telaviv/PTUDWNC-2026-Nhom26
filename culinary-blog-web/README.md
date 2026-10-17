This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Chế độ Mock và tài khoản demo

Khi `USE_MOCK_API=true` / `NEXT_PUBLIC_USE_MOCK_API=true`, ứng dụng không cần backend .NET:

- Đăng nhập bằng tài khoản demo: **demo@culinary.vn** / **Demo@123**
- Danh sách công thức lấy từ `lib/mock/recipes.ts`
- Bình luận phân trang (mỗi trang 10, tổng ~25) lấy từ route handler `app/api/mock/comments`

## Đăng nhập Google (tùy chọn)

Social login chỉ được đăng ký khi cấu hình đủ `GOOGLE_CLIENT_ID` và `GOOGLE_CLIENT_SECRET` trong `.env.local`.
Nút "Đăng nhập với Google" chỉ hiện khi `NEXT_PUBLIC_GOOGLE_ENABLED=true` (biến `NEXT_PUBLIC_` được nhúng lúc build,
không lộ client_id/secret cho phía client).

### Lấy khóa trên Google Cloud Console

1. Vào [Google Cloud Console](https://console.cloud.google.com/) → tạo/chọn một project.
2. **APIs & Services → OAuth consent screen** → chọn *External*, điền tên ứng dụng, email hỗ trợ, save.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID**.
4. Chọn **Application type = Web application**.
5. Ở **Authorized redirect URI**, thêm đúng:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
6. Save rồi copy **Client ID** và **Client secret**.
7. Dán vào `.env.local`:
   ```
   GOOGLE_CLIENT_ID=<client id>
   GOOGLE_CLIENT_SECRET=<client secret>
   NEXT_PUBLIC_GOOGLE_ENABLED=true
   ```

### luồng đổi token

Khi người dùng đăng nhập bằng Google, `lib/auth.ts` gọi `POST ${API_URL}/api/v1/auth/google` với `{ idToken }`
để đổi Google `id_token` lấy JWT của backend, rồi gắn `accessToken`/`refreshToken` của backend vào token.

- Chế độ mock (`USE_MOCK_API=true`): bỏ qua gọi backend, dùng token giả `mock-access-token-google`.
- Nếu gọi backend lỗi: chỉ ghi log phía server và để token không có `accessToken` (đăng nhập không bị sập).

## Phân tích dung lượng bundle

Next.js 16 dùng Turbopack mặc định, nên dùng công cụ phân tích tích hợp sẵn (không cần thêm thư viện,
không cần `cross-env`):

```bash
npm run analyze          # mở giao diện web tương tác tại http://localhost:4000
npm run analyze:output   # chỉ ghi file kết quả vào .next/diagnostics/analyze, không mở server
```

Lưu ý: lệnh này biên dịch vào thư mục `.next` của dự án, nên hãy **dừng `npm run dev` đang chạy**
trước khi chạy để tránh xung đột cache.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
