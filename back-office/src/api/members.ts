/**
 * 직원 API.
 * - listAdminMembers: 실제 core-api(GET /admins/members) — 직원 목록 화면(/members)이 쓴다.
 * - 그 밖의 함수: 아직 in-memory mock(src/mocks)을 호출한다. core-api에 API가 생기면 함수 내부만 apiClient 호출로 바꾼다.
 *   경로는 예정안이며 core-api 컨트롤러 확정 시 맞춘다.
 */
import { mockRequest } from '../mocks/delay'
import { memberStore } from '../mocks/memberStore'
import type { ApiEnvelope } from '../types/common'
import { apiClient } from './client'
import type {
  AdminMemberListQuery,
  AdminMemberListResponse,
  ChangeMemberStatusRequest,
  CreateMemberRequest,
  MemberDetail,
  MemberListQuery,
  MemberListResponse,
  UpdateMemberPatch,
} from '../types/member'

/**
 * [core-api] GET /admins/members?keyword=&statuses=&page=&limit=&sort=&order=
 * keyword는 이름·이메일·사번 통합 부분 일치 검색이다. trim 후 비어 있으면 보내지 않는다.
 * 값이 없는(undefined·빈 문자열·빈 배열) 파라미터는 보내지 않는다.
 * statuses는 apiClient의 paramsSerializer 설정으로 `statuses=a&statuses=b` 형태로 나간다.
 */
export async function listAdminMembers(query: AdminMemberListQuery): Promise<AdminMemberListResponse> {
  const params: AdminMemberListQuery = {}
  const keyword = query.keyword?.trim()
  if (keyword) params.keyword = keyword
  if (query.statuses?.length) params.statuses = query.statuses
  if (query.page != null) params.page = query.page
  if (query.limit != null) params.limit = query.limit
  // core-api는 sort와 order가 둘 다 있을 때만 정렬한다
  if (query.sort && query.order) {
    params.sort = query.sort
    params.order = query.order
  }
  const response = await apiClient.get<ApiEnvelope<AdminMemberListResponse>>('/admins/members', { params })
  const data = response.data.data
  return {
    members: Array.isArray(data?.members) ? data.members : [],
    total: typeof data?.total === 'number' ? data.total : 0,
    page: data?.page ?? query.page,
    limit: data?.limit ?? query.limit,
  }
}

/**
 * [mock] 직원 목록 — 부서장 선택지(useActiveMemberOptions) 등 아직 mock인 화면용.
 * 실제 목록 화면은 listAdminMembers를 쓴다. mock 부서·역할과 짝이 맞는 mock 직원을 돌려준다.
 */
export function listMembers(query: MemberListQuery): Promise<MemberListResponse> {
  return mockRequest(() => memberStore.list(query))
}

/** GET /admins/members/:id */
export function getMember(id: number): Promise<MemberDetail> {
  return mockRequest(() => memberStore.get(id))
}

/** POST /admins/members — 재직 상태로 등록, 생성된 id를 돌려준다 */
export function createMember(body: CreateMemberRequest): Promise<{ id: number }> {
  return mockRequest(() => memberStore.create(body))
}

/**
 * PUT /admins/members/:id — 부분 업데이트(실제 API는 PUT 예정, PATCH 아님).
 * patch에는 바뀐 필드만 담는다: 키 없음 = 유지, null = 비움(연락처·부서·역할), 값 = 변경.
 */
export function updateMember(id: number, patch: UpdateMemberPatch): Promise<MemberDetail> {
  return mockRequest(() => memberStore.update(id, patch))
}

/**
 * PUT /admins/members/:id/status — 재직 상태 변경(휴직·복직·퇴사·재직으로 되돌리기).
 * 퇴사는 exitedOn 필수. 경로는 core-api 확정 시 맞춘다.
 */
export function changeMemberStatus(id: number, body: ChangeMemberStatusRequest): Promise<MemberDetail> {
  return mockRequest(() => memberStore.changeStatus(id, body))
}
