import type { FieldErrorItem } from '../types/common'

/**
 * 화면이 다루는 공통 API 오류.
 * mock 저장소와 (나중의) axios 인터셉터가 모두 이 형태로 던진다.
 */
export class ApiError extends Error {
  readonly status: number
  readonly fieldErrors: FieldErrorItem[]

  constructor(status: number, message: string, fieldErrors: FieldErrorItem[] = []) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
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
