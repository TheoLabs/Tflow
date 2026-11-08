import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getMember, listMembers } from '../../api/members'
import { queryKeys } from '../../lib/queryKeys'
import type { MemberListQuery } from '../../types/member'

export function useMemberList(query: MemberListQuery) {
  return useQuery({
    queryKey: queryKeys.members.list(query),
    queryFn: () => listMembers(query),
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

/** 부서장 선택지용 재직 직원 목록 */
export function useActiveMemberOptions() {
  return useQuery({
    queryKey: queryKeys.members.active,
    queryFn: () => listMembers({ status: 'active', page: 1, size: 1000 }),
    select: (res) => [...res.items].sort((a, b) => a.name.localeCompare(b.name, 'ko')),
  })
}
