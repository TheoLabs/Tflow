/**
 * 부서 API.
 * - createDepartment: 실제 core-api(POST /admins/departments).
 * - 그 밖의 함수(목록·수정·삭제): 아직 in-memory mock(src/mocks)을 호출한다.
 *   core-api의 GET /admins/departments는 아직 빈 data만 돌려주므로 목록은 mock을 유지한다.
 *   연동 시 각 함수 내부만 apiClient 호출로 바꾼다. 경로는 예정안이며 core-api 컨트롤러 확정 시 맞춘다.
 */
import { departmentStore } from '../mocks/departmentStore'
import { mockRequest } from '../mocks/delay'
import { apiClient } from './client'
import type { ApiEnvelope } from '../types/common'
import type {
  AdminCreateDepartmentBody,
  CreateDepartmentRequest,
  DepartmentDeleteImpact,
  DepartmentListItem,
  UpdateDepartmentPatch,
} from '../types/department'

/** GET /admins/departments — 평면 목록(프론트에서 트리로 조립) */
export function listDepartments(): Promise<DepartmentListItem[]> {
  // 연동 시: return apiClient.get<DepartmentListItem[]>('/admins/departments').then((r) => r.data)
  return mockRequest(() => departmentStore.list())
}

/**
 * [core-api] POST /admins/departments
 * 화면 필드명(parentId)을 core-api 필드명(parentDepartmentId)으로 바꾼다.
 * 값이 없는(undefined·null) 상위 부서·부서장은 키를 생략한다(= 미지정).
 * 성공 응답은 `{ data: {} }`라 생성된 id를 돌려주지 않는다.
 * 오류는 apiClient 인터셉터가 ApiError(status, message, [], code)로 바꿔 던진다.
 *   DEPARTMENT_NAME_DUPLICATED(400) · DEPARTMENT_NOT_FOUND(404) · MEMBER_NOT_FOUND(404) · BAD_REQUEST(400)
 */
export async function createDepartment(input: CreateDepartmentRequest): Promise<void> {
  const body: AdminCreateDepartmentBody = { name: input.name }
  if (input.parentId != null) body.parentDepartmentId = input.parentId
  if (input.leaderMemberId != null) body.leaderMemberId = input.leaderMemberId
  await apiClient.post<ApiEnvelope<Record<string, never>>>('/admins/departments', body)
}

/**
 * PUT /admins/departments/:id — 부분 업데이트(실제 API는 PUT 예정, PATCH 아님).
 * patch에는 바뀐 필드만: 키 없음 = 유지, null = 비움(parentId → 최상위, leaderMemberId → 부서장 없음), 값 = 변경.
 */
export function updateDepartment(id: number, patch: UpdateDepartmentPatch): Promise<DepartmentListItem> {
  return mockRequest(() => departmentStore.update(id, patch))
}

/** GET /admins/departments/:id/delete-impact — 삭제 시 영향받는 소속 직원 수 · 하위 부서 수 */
export function getDepartmentDeleteImpact(id: number): Promise<DepartmentDeleteImpact> {
  return mockRequest(() => departmentStore.deleteImpact(id))
}

/** DELETE /admins/departments/:id — 소속 직원은 미배정, 하위 부서는 한 단계 위로 */
export function deleteDepartment(id: number): Promise<void> {
  return mockRequest(() => departmentStore.remove(id))
}
