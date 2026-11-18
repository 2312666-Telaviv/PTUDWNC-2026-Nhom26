/**
 * Định dạng chuỗi ngày giờ theo múi giờ Việt Nam (vi-VN).
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Định dạng số tiền theo đơn vị VNĐ.
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

/**
 * Chuyển chuỗi tiêu đề thành slug URL an toàn.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
const blogDateTimeFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'UTC',
});

/** Định dạng ngày giờ, ví dụ: 18/05/2024 10:20 */
export function formatDateTime(isoDate: string): string {
  return blogDateTimeFormatter.format(new Date(isoDate));
}

/** Định dạng số có dấu phân cách nghìn, ví dụ: 12.480 */
export function formatNumber(value: number): string {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}