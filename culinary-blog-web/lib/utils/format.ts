// CÃ¡c hÃ m Ä‘á»‹nh dáº¡ng dÃ¹ng chung cho giao diá»‡n blog.
// NgÃ y thÃ¡ng cá»‘ Ä‘á»‹nh timeZone 'UTC' vÃ  sá»‘ dÃ¹ng Ä‘á»‹nh dáº¡ng thá»§ cÃ´ng Ä‘á»ƒ káº¿t quáº£
// giá»‘ng nhau trÃªn server vÃ  client (trÃ¡nh lá»—i hydration mismatch).

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

/** Äá»‹nh dáº¡ng ngÃ y, vÃ­ dá»¥: 18/05/2024 */
export function formatDate(isoDate: string): string {
  return dateFormatter.format(new Date(isoDate));
}

/** Äá»‹nh dáº¡ng ngÃ y giá», vÃ­ dá»¥: 18/05/2024 10:20 */
export function formatDateTime(isoDate: string): string {
  return dateTimeFormatter.format(new Date(isoDate));
}

/**
 * Äá»‹nh dáº¡ng sá»‘ tiá»n theo Ä‘Æ¡n vá»‹ VNÄ. (tá»« nhÃ¡nh HÆ°Æ¡ng)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

/**
 * Chuyá»ƒn chuá»—i tiÃªu Ä‘á» thÃ nh slug URL an toÃ n. (tá»« nhÃ¡nh HÆ°Æ¡ng)
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Äá»‹nh dáº¡ng sá»‘ cÃ³ dáº¥u phÃ¢n cÃ¡ch nghÃ¬n, vÃ­ dá»¥: 12.480 */
export function formatNumber(value: number): string {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

