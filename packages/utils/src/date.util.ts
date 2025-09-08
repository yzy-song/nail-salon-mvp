export function formatDate(date: Date): string {
  // 这是一个非常简单的实现，仅用于演示。
  // 在真实项目中，推荐使用 date-fns 或 day.js 这样的库。
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}
