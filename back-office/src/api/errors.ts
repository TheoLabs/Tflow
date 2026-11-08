import type { FieldErrorItem } from '../types/common'

/**
 * 화면이 다루는 공통 API 오류.
 * mock 저장소와 axios 인터셉터(src/api/client.ts)가 모두 이 형태로 던진다.
 * - status: HTTP 상태 코드 (0 = 서버에 닿지 못함)
 * - code: core-api 오류 코드(data.code). mock 오류와 연결 실패에는 없다
 * - fieldErrors: 항목별 오류 — 지금은 mock만 채운다(core-api는 첫 오류 문구 하나만 준다)
 */
export class ApiError extends Error {
  readonly status: number
  readonly fieldErrors: FieldErrorItem[]
  readonly code?: string

  constructor(status: number, message: string, fieldErrors: FieldErrorItem[] = [], code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
    this.code = code
  }

  static validation(fieldErrors: FieldErrorItem[], status = 400): ApiError {
    return new ApiError(status, fieldErrors[0]?.message ?? '입력값을 확인해 주세요.', fieldErrors)
  }

  static notFound(message: string): ApiError {
    return new ApiError(404, message)
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

export function isNotFound(error: unknown): boolean {
  return isApiError(error) && error.status === 404
}

/** 사용자에게 보여 줄 오류 문구 */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) return error.message
  if (error instanceof Error && error.message) return error.message
  return '알 수 없는 오류가 발생했습니다.'
}
