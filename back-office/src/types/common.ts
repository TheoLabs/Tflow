// 임시 타입 — core-api DTO 확정 시 맞출 것

/** id와 이름만 담은 참조(부서·역할·부서장 등) */
export interface IdName {
  id: number
  name: string
}

/** 페이지 나눔 응답 */
export interface Page<T> {
  items: T[]
  total: number
  page: number
  size: number
}

/** 항목별 오류 — 서버가 어떤 필드가 문제인지 알려 줄 때 */
export interface FieldErrorItem {
  field: string
  message: string
}
