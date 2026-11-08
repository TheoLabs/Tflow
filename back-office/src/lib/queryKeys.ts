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
  },
  departments: {
    all: ['departments'] as const,
    list: ['departments', 'list'] as const,
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
