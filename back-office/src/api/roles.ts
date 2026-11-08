/**
 * 역할 API.
 * 지금은 in-memory mock(src/mocks)을 호출한다. core-api 연동 시 각 함수 내부만 apiClient 호출로 바꾼다.
 * 경로는 예정안이며 core-api 컨트롤러 확정 시 맞춘다.
 */
import { mockRequest } from '../mocks/delay'
import { roleStore } from '../mocks/roleStore'
import type { CreateRoleRequest, RoleDetail, RoleListItem, UpdateRolePatch } from '../types/role'

/** GET /admins/roles */
export function listRoles(): Promise<RoleListItem[]> {
  // 연동 시: return apiClient.get<RoleListItem[]>('/admins/roles').then((r) => r.data)
  return mockRequest(() => roleStore.list())
}

/** GET /admins/roles/:id — 배정된 직원 포함 */
export function getRole(id: number): Promise<RoleDetail> {
  return mockRequest(() => roleStore.get(id))
}

/** POST /admins/roles */
export function createRole(body: CreateRoleRequest): Promise<RoleListItem> {
  return mockRequest(() => roleStore.create(body))
}

/**
 * PUT /admins/roles/:id — 부분 업데이트(실제 API는 PUT 예정, PATCH 아님).
 * patch에는 바뀐 필드만: 키 없음 = 유지, null = 비움(설명), permissions는 보내면 배열 통째로 교체.
 */
export function updateRole(id: number, patch: UpdateRolePatch): Promise<RoleListItem> {
  return mockRequest(() => roleStore.update(id, patch))
}

/** DELETE /admins/roles/:id — 배정 직원은 역할 미배정 */
export function deleteRole(id: number): Promise<void> {
  return mockRequest(() => roleStore.remove(id))
}
