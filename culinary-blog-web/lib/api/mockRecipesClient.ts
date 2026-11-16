import axios from 'axios';

// Client riêng cho các API route mock chạy trong chính Next.js.
// Dùng URL tương đối để cookie phiên NextAuth được gửi kèm (same-origin).
const mockRecipesClient = axios.create({
  baseURL: '/api/mock/recipes',
  timeout: 10000,
});

export default mockRecipesClient;
