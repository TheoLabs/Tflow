import { useQuery } from '@tanstack/react-query'
import { listDepartments } from '../../api/departments'
import { queryKeys } from '../../lib/queryKeys'

export function useDepartments() {
  return useQuery({ queryKey: queryKeys.departments.list, queryFn: listDepartments })
}
