import axios, { AxiosError } from 'axios'
import { ApiError } from './errors'
import type { FieldErrorItem } from '../types/common'

/**
 * core-api용 axios 인스턴스.
 * 지금은 mock 저장소를 쓰므로 사용하지 않는다. 실제 연동 시 src/api/*.ts 함수 내부에서 이 인스턴스를 쓴다.
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000',
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
})

/**
 * 서버 오류를 ApiError로 통일한다.
 * TODO(core-api 연동): core-api의 실제 오류 응답 형태가 정해지면 아래 매핑을 맞춘다.
 *   현재 가정 — { message: string | string[], errors?: { field, message }[] }
 */
interface ServerErrorBody {
  message?: string | string[]
  errors?: FieldErrorItem[]
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ServerErrorBody>) => {
    if (!error.response) {
      return Promise.reject(new ApiError(0, '서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.'))
    }
    const { status, data } = error.response
    const rawMessage = Array.isArray(data?.message) ? data.message.join(', ') : data?.message
    return Promise.reject(
      new ApiError(status, rawMessage ?? `요청을 처리하지 못했습니다. (${status})`, data?.errors ?? []),
    )
  },
)
