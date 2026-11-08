// mock 화면용 임시 타입 — core-api에 해당 API가 생기면 DTO에 맞출 것

/** core-api 공통 응답 봉투 — 성공·실패 모두 { data: ... } 로 감싼다 */
export interface ApiEnvelope<T> {
  data: T
}

/** core-api 오류 응답의 data (ExceptionFilter). 4xx의 message는 사용자에게 보여 줄 문구다 */
export interface ApiErrorBody {
  code: string
  /** 보통 문자열. ValidationPipe 폴백 등에서 배열이 올 수 있다 */
  message: string | string[]
}

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
