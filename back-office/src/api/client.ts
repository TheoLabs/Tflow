import axios, { AxiosError } from 'axios'
import { ApiError } from './errors'
import type { ApiEnvelope, ApiErrorBody } from '../types/common'

/**
 * core-api용 axios 인스턴스.
 *
 * baseURL 기본값은 빈 문자열(= 현재 origin 기준 상대 경로)이다.
 * dev에서는 Vite dev server proxy(vite.config.ts)가 `/admins/*`를 core-api(http://localhost:3000)로 넘긴다.
 * core-api에 CORS 설정이 없으므로 브라우저가 core-api에 직접 붙지 않게 하기 위함이다.
 * 다른 주소로 붙여야 하면 VITE_API_BASE_URL로 덮어쓴다(이때는 그 서버가 CORS를 허용해야 한다).
 *
 * 지금은 직원 목록(GET /admins/members)만 이 인스턴스를 쓴다. 나머지 API는 아직 mock이다.
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
  // 배열 쿼리는 같은 키를 반복한다: { statuses: ['active', 'onLeave'] } → statuses=active&statuses=onLeave
  // (axios 기본값은 statuses[]=active 라 core-api @ToArray()가 인식하지 못한다). 배열이 아닌 값은 기본과 같다.
  paramsSerializer: { indexes: null },
})

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  if (typeof value !== 'object' || value === null) return false
  const { code, message } = value as Record<string, unknown>
  return typeof code === 'string' && (typeof message === 'string' || Array.isArray(message))
}

/**
 * 서버 오류를 ApiError로 통일한다.
 * core-api ExceptionFilter 응답: `{ data: { code: string, message: string } }`
 *   - 4xx: message가 사용자에게 보여 줄 문구다.
 *   - 5xx: core-api가 이미 일반 문구('서버에 예기치 않은 오류가 발생했습니다.')로 감춰서 준다.
 * 이 형태가 아니면(프록시 오류·core-api 미기동 등) 상태 코드 기반 문구로 대신한다.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<Partial<ApiEnvelope<unknown>>>) => {
    if (!error.response) {
      return Promise.reject(new ApiError(0, '서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.'))
    }
    const { status, data } = error.response
    const body = data?.data
    if (isApiErrorBody(body)) {
      const message = Array.isArray(body.message) ? body.message.join(', ') : body.message
      return Promise.reject(new ApiError(status, message || `요청을 처리하지 못했습니다. (${status})`, [], body.code))
    }
    const fallback =
      status >= 500
        ? `서버에 연결할 수 없거나 오류가 발생했습니다. (${status})`
        : `요청을 처리하지 못했습니다. (${status})`
    return Promise.reject(new ApiError(status, fallback))
  },
)
