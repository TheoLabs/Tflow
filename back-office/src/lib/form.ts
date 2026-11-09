import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import { getErrorMessage, isApiError } from '../api/errors'

/**
 * react-hook-form dirtyFields 값이 '바뀜'인지 판단한다.
 * 배열/객체 필드는 하위 플래그 중 하나라도 true면 바뀐 것으로 본다.
 */
export function isFieldDirty(flag: unknown): boolean {
  if (flag === true) return true
  if (Array.isArray(flag)) return flag.some(isFieldDirty)
  if (flag && typeof flag === 'object') return Object.values(flag).some(isFieldDirty)
  return false
}

/** 바뀐 필드 이름 목록 */
export function dirtyFieldNames<T extends FieldValues>(dirtyFields: Partial<Record<keyof T, unknown>>): (keyof T)[] {
  return (Object.keys(dirtyFields) as (keyof T)[]).filter((key) => isFieldDirty(dirtyFields[key]))
}

/**
 * 서버(또는 mock)가 던진 항목별 오류를 폼 항목 옆에 표시한다.
 * - fields에 있는 항목 오류는 setError로 해당 항목에 붙인다.
 * - 항목에 붙일 수 없는 오류(일반 오류, 폼에 없는 필드)는 notify로 알린다(보통 토스트).
 * @returns 항목에 붙인 오류가 하나라도 있으면 true
 */
export function applyServerErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: readonly Path<T>[],
  notify: (message: string) => void,
): boolean {
  if (!isApiError(error) || error.fieldErrors.length === 0) {
    notify(getErrorMessage(error))
    return false
  }

  let mapped = false
  let focused = false
  const leftovers: string[] = []
  for (const { field, message } of error.fieldErrors) {
    if ((fields as readonly string[]).includes(field)) {
      setError(field as Path<T>, { type: 'server', message }, { shouldFocus: !focused })
      focused = true
      mapped = true
    } else {
      leftovers.push(message)
    }
  }
  if (leftovers.length > 0) notify(leftovers.join(' '))
  return mapped
}

/** select 값('' = 미배정/없음)을 API 값(null = 비움)으로 */
export function selectToId(value: string): number | null {
  return value === '' ? null : Number(value)
}

/** API 값(null)을 select 값('')으로 */
export function idToSelect(value: number | null | undefined): string {
  return value == null ? '' : String(value)
}

/** 빈 문자열은 null(비움)로 */
export function blankToNull(value: string): string | null {
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

/**
 * core-api 오류 코드(ApiError.code)를 폼 항목 오류로 표시한다.
 * core-api는 fieldErrors를 주지 않고 `{ code, message }`만 주므로, 화면이 code → 항목을 정해 준다.
 * - codeToField에 있는 code면 그 항목에 서버 message를 붙이고 포커스한다.
 * - 없으면 applyServerErrors로 넘긴다(mock fieldErrors 처리 또는 notify로 문구 표시 — BAD_REQUEST 등).
 * @returns 항목에 붙인 오류가 하나라도 있으면 true
 */
export function applyServerErrorCodes<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  codeToField: Readonly<Partial<Record<string, Path<T>>>>,
  fields: readonly Path<T>[],
  notify: (message: string) => void,
): boolean {
  const field = isApiError(error) && error.code ? codeToField[error.code] : undefined
  if (field) {
    setError(field, { type: 'server', message: getErrorMessage(error) }, { shouldFocus: true })
    return true
  }
  return applyServerErrors(error, setError, fields, notify)
}
