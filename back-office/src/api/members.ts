/**
 * 직원 API.
 * 지금은 in-memory mock(src/mocks)을 호출한다. core-api 연동 시 각 함수 내부만 apiClient 호출로 바꾼다.
 * 경로는 예정안이며 core-api 컨트롤러 확정 시 맞춘다.
 */
import { mockRequest } from '../mocks/delay'
import { memberStore } from '../mocks/memberStore'
import type {
  ChangeMemberStatusRequest,
  CreateMemberRequest,
  MemberDetail,
  MemberListQuery,
  MemberListResponse,
  UpdateMemberPatch,
} from '../types/member'

/** GET /admins/members?q=&status=&departmentId=&roleId=&page=&size= ('none' = 미배정) */
export function listMembers(query: MemberListQuery): Promise<MemberListResponse> {
  // 연동 시: return apiClient.get<MemberListResponse>('/admins/members', { params: query }).then((r) => r.data)
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
