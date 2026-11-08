/** 오늘 날짜 YYYY-MM-DD (로컬 기준) */
export function todayIso(): string {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60_000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '-'
  return value.slice(0, 10).replaceAll('-', '.')
}
