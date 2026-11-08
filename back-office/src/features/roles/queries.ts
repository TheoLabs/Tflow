import { useQuery } from '@tanstack/react-query'
import { getRole, listRoles } from '../../api/roles'
import { queryKeys } from '../../lib/queryKeys'

export function useRoles() {
  return useQuery({ queryKey: queryKeys.roles.list, queryFn: listRoles })
}

export function useRole(id: number) {
  return useQuery({ queryKey: queryKeys.roles.detail(id), queryFn: () => getRole(id), enabled: Number.isFinite(id) })
}
