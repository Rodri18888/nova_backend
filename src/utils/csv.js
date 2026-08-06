export function sanitizeCsvField(val) {
  const str = String(val ?? '')
  if (/^[=+\-@\t\r]/.test(str)) return `'${str.replace(/"/g, '""')}'`
  return `"${str.replace(/"/g, '""')}"`
}
