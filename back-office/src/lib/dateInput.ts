import dayjs, { type Dayjs } from 'dayjs'

/** 폼 값은 'YYYY-MM-DD' 문자열('' = 비어 있음) 그대로 두고, DatePicker와 주고받을 때만 dayjs로 바꾼다 */
export const DATE_FORMAT = 'YYYY-MM-DD'

export function toDayjs(value: string | null | undefined): Dayjs | null {
  if (!value) return null
  const parsed = dayjs(value)
  return parsed.isValid() ? parsed : null
}

export function fromDayjs(value: Dayjs | null): string {
  return value ? value.format(DATE_FORMAT) : ''
}
