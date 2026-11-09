import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getMember, listAdminMembers, listMembers } from '../../api/members'
import { queryKeys } from '../../lib/queryKeys'
import type { AdminMemberListQuery } from '../../types/member'

/** 직원 목록 화면 — 실제 core-api(GET /admins/members) */
export function useMemberList(query: AdminMemberListQuery) {
  return useQuery({
    queryKey: queryKeys.members.adminList(query),
    queryFn: () => listAdminMembers(query),
    placeholderData: keepPreviousData,
  })
}

export function useMember(id: number) {
  return useQuery({
    queryKey: queryKeys.members.detail(id),
    queryFn: () => getMember(id),
    enabled: Number.isFinite(id),
  })
}

/** 부서장 검색 결과 최대 건수 — 그 밖의 직원은 검색어로 좁혀 찾는다 */
export const ACTIVE_MEMBER_SEARCH_LIMIT = 20

/**
 * 부서장 선택지 — 실제 core-api(GET /admins/members?statuses=active&keyword=)로 재직 직원을 서버 검색한다.
 * keyword는 이름·이메일·사번 부분 일치. 빈 문자열이면 이름순 앞쪽 일부만 가져온다.
 * 호출하는 쪽에서 keyword를 디바운스해서 넘긴다.
 */
export function useActiveMemberSearch(keyword: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.members.activeSearch(keyword),
    queryFn: () =>
      listAdminMembers({
        keyword,
        statuses: ['active'],
        page: 1,
        limit: ACTIVE_MEMBER_SEARCH_LIMIT,
        sort: 'name',
        order: 'ASC',
      }),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })
}

/** 부서장 선택지용 재직 직원 목록 — mock (부서 화면이 아직 mock이라 mock 직원과 짝을 맞춘다) */
export function useActiveMemberOptions() {
  return useQuery({
    queryKey: queryKeys.members.active,
    queryFn: () => listMembers({ status: 'active', page: 1, size: 1000 }),
    select: (res) => [...res.items].sort((a, b) => a.name.localeCompare(b.name, 'ko')),
  })
}
