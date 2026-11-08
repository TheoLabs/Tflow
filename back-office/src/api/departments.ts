/**
 * 부서 API.
 * 지금은 in-memory mock(src/mocks)을 호출한다. core-api 연동 시 각 함수 내부만 apiClient 호출로 바꾼다.
 * 경로는 예정안이며 core-api 컨트롤러 확정 시 맞춘다.
 */
import { departmentStore } from '../mocks/departmentStore'
import { mockRequest } from '../mocks/delay'
import type {
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

/** POST /admins/departments */
export function createDepartment(body: CreateDepartmentRequest): Promise<DepartmentListItem> {
  return mockRequest(() => departmentStore.create(body))
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
