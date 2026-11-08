import { ApiError } from '../api/errors'
import type { FieldErrorItem } from '../types/common'

/** 항목별 오류를 모았다가 한 번에 던진다 — 서버 검증 흉내 */
export class FieldErrorCollector {
  private readonly errors: FieldErrorItem[] = []

  add(field: string, message: string): void {
    if (!this.errors.some((e) => e.field === field)) this.errors.push({ field, message })
  }

  get hasErrors(): boolean {
    return this.errors.length > 0
  }

  /** 오류가 있으면 throw. status는 형식 오류 400 / 충돌 409 등 */
  throwIfAny(status = 400): void {
    if (this.hasErrors) throw ApiError.validation(this.errors, status)
  }
}

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export function isBlank(value: string | null | undefined): boolean {
  return value == null || value.trim() === ''
}

export function normalize(value: string): string {
  return value.trim().toLowerCase()
}

/** undefined는 '키 없음'으로 본다 */
export function has<T extends object>(obj: T, key: keyof T): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key) && obj[key] !== undefined
}
