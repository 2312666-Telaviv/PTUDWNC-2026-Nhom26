// Các hàm định dạng dùng chung cho giao diện blog.
// Ngày tháng cố định timeZone 'UTC' và số dùng định dạng thủ công để kết quả
// giống nhau trên server và client (tránh lỗi hydration mismatch).

const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'UTC',
});

const dateTimeFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'UTC',
});

/** Định dạng ngày, ví dụ: 18/05/2024 */
export function formatDate(isoDate: string): string {
  return dateFormatter.format(new Date(isoDate));
}

/** Định dạng ngày giờ, ví dụ: 18/05/2024 10:20 */
export function formatDateTime(isoDate: string): string {
  return dateTimeFormatter.format(new Date(isoDate));
}

/** Định dạng số có dấu phân cách nghìn, ví dụ: 12.480 */
export function formatNumber(value: number): string {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
