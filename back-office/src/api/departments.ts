/**
 * 부서 API.
 * - createDepartment: 실제 core-api(POST /admins/departments).
 * - listAdminDepartments: 실제 core-api(GET /admins/departments) — 등록 폼의 상위 부서 선택지가 쓴다.
 * - getAdminDepartmentTree: 실제 core-api(GET /admins/departments/tree) — 부서 관리 화면의 트리가 쓴다.
 * - listDepartments(mock): 직원 화면(부서 필터·부서 배정 선택지)이 아직 쓴다. 부서 화면은 쓰지 않는다.
 * - updateDepartment · getDepartmentDeleteImpact · deleteDepartment(mock): core-api에 수정·삭제 API가 없다.
 *   부서 화면의 트리가 실제 id라 mock 스토어와 id가 맞지 않으므로 **어디서도 호출하지 않는다**(읽기 전용 패널).
 *   API가 생기면 함수 내부를 apiClient 호출로 바꾼 뒤 화면에 연결한다.
 */
import { departmentStore } from '../mocks/departmentStore'
import { mockRequest } from '../mocks/delay'
import { apiClient } from './client'
import type { ApiEnvelope } from '../types/common'
import { normalizeDepartmentTree } from '../types/department'
import type {
  AdminCreateDepartmentBody,
  AdminDepartment,
  AdminDepartmentListQuery,
  AdminDepartmentListResponse,
  AdminDepartmentTreeItem,
  CreateDepartmentRequest,
  DepartmentDeleteImpact,
  DepartmentListItem,
  DepartmentTreeItem,
  UpdateDepartmentPatch,
} from '../types/department'

/** [mock] 부서 평면 목록 — 직원 화면의 부서 선택지가 아직 쓴다(부서 화면 트리는 getAdminDepartmentTree) */
export function listDepartments(): Promise<DepartmentListItem[]> {
  // 연동 시: return apiClient.get<DepartmentListItem[]>('/admins/departments').then((r) => r.data)
  return mockRequest(() => departmentStore.list())
}

/**
 * [core-api] GET /admins/departments/tree — 쿼리 없음, 전체 부서를 평면 배열로 돌려준다(`{ data: [...] }`).
 * 정렬이 보장되지 않고 부서장 이름·하위 부서 수가 없다. 화면 타입으로 정규화(childCount 계산 포함)해 돌려준다.
 */
export async function getAdminDepartmentTree(): Promise<DepartmentTreeItem[]> {
  const response = await apiClient.get<ApiEnvelope<AdminDepartmentTreeItem[]>>('/admins/departments/tree')
  return normalizeDepartmentTree(response.data.data)
}

/**
 * [core-api] GET /admins/departments?keyword=&page=&limit=&sort=&order=
 * 빈 검색어·없는 값은 보내지 않는다. sort와 order는 둘 다 있을 때만 보낸다(core-api도 둘 다 있어야 정렬한다).
 * 응답은 DTO 없이 엔티티 그대로라, 쓰는 네 필드만 골라 정규화한다.
 */
export async function listAdminDepartments(query: AdminDepartmentListQuery): Promise<AdminDepartmentListResponse> {
  const params: AdminDepartmentListQuery = {}
  const keyword = query.keyword?.trim()
  if (keyword) params.keyword = keyword
  if (query.page != null) params.page = query.page
  if (query.limit != null) params.limit = query.limit
  if (query.sort && query.order) {
    params.sort = query.sort
    params.order = query.order
  }
  const response = await apiClient.get<ApiEnvelope<AdminDepartmentListResponse>>('/admins/departments', { params })
  const data = response.data.data
  const departments: AdminDepartment[] = Array.isArray(data?.departments)
    ? data.departments.map((d) => ({
        id: d.id,
        name: d.name,
        parentDepartmentId: d.parentDepartmentId ?? null,
        leaderMemberId: d.leaderMemberId ?? null,
      }))
    : []
  return {
    departments,
    total: typeof data?.total === 'number' ? data.total : departments.length,
    page: data?.page ?? query.page,
    limit: data?.limit ?? query.limit,
  }
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
 * [mock · 호출 금지] PUT /admins/departments/:id — 부분 업데이트(실제 API는 PUT 예정, PATCH 아님).
 * patch에는 바뀐 필드만: 키 없음 = 유지, null = 비움(parentId → 최상위, leaderMemberId → 부서장 없음), 값 = 변경.
 */
export function updateDepartment(id: number, patch: UpdateDepartmentPatch): Promise<DepartmentListItem> {
  return mockRequest(() => departmentStore.update(id, patch))
}

/** [mock · 호출 금지] GET /admins/departments/:id/delete-impact — 삭제 시 영향받는 소속 직원 수 · 하위 부서 수 */
export function getDepartmentDeleteImpact(id: number): Promise<DepartmentDeleteImpact> {
  return mockRequest(() => departmentStore.deleteImpact(id))
}

/** [mock · 호출 금지] DELETE /admins/departments/:id — 소속 직원은 미배정, 하위 부서는 한 단계 위로 */
export function deleteDepartment(id: number): Promise<void> {
  return mockRequest(() => departmentStore.remove(id))
}
