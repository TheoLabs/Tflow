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

/** 부서장 선택지용 재직 직원 목록 — mock (부서 화면이 아직 mock이라 mock 직원과 짝을 맞춘다) */
export function useActiveMemberOptions() {
  return useQuery({
    queryKey: queryKeys.members.active,
    queryFn: () => listMembers({ status: 'active', page: 1, size: 1000 }),
    select: (res) => [...res.items].sort((a, b) => a.name.localeCompare(b.name, 'ko')),
  })
}
