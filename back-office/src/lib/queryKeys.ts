import type { QueryClient } from '@tanstack/react-query'
import type { AdminMemberListQuery, MemberListQuery } from '../types/member'

export const queryKeys = {
  members: {
    all: ['members'] as const,
    /** mock 목록 */
    list: (query: MemberListQuery) => ['members', 'list', query] as const,
    /** core-api 목록 (GET /admins/members) */
    adminList: (query: AdminMemberListQuery) => ['members', 'admin-list', query] as const,
    detail: (id: number) => ['members', 'detail', id] as const,
    active: ['members', 'active-options'] as const,
    /** core-api 재직 직원 검색(부서장 선택지) */
    activeSearch: (keyword: string) => ['members', 'active-search', keyword] as const,
  },
  departments: {
    all: ['departments'] as const,
    /** mock 목록 — 직원 화면의 부서 선택지 */
    list: ['departments', 'list'] as const,
    /** core-api 부서 트리(GET /admins/departments/tree) */
    tree: ['departments', 'tree'] as const,
    /** core-api 부서 검색(GET /admins/departments) 전체 — 등록 후 무효화용 접두어 */
    adminSearchAll: ['departments', 'admin-search'] as const,
    /** core-api 부서 검색(상위 부서 선택지) */
    adminSearch: (keyword: string) => ['departments', 'admin-search', keyword] as const,
  },
  roles: {
    all: ['roles'] as const,
    list: ['roles', 'list'] as const,
    detail: (id: number) => ['roles', 'detail', id] as const,
  },
}

/**
 * 직원·부서·역할은 서로의 표시 값(부서명, 배정 인원, 부서장 등)에 영향을 주므로
 * 변경 후에는 세 도메인 쿼리를 함께 무효화한다.
 */
export function invalidateOrganization(queryClient: QueryClient): Promise<unknown> {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.members.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.departments.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.roles.all }),
  ])
}
