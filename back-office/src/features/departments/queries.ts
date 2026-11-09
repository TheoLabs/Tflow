import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getAdminDepartmentTree, listAdminDepartments, listDepartments } from '../../api/departments'
import { queryKeys } from '../../lib/queryKeys'

/** [mock] 부서 목록 — 직원 화면(부서 필터·배정 선택지)용. 부서 관리 화면은 useDepartmentTree를 쓴다 */
export function useDepartments() {
  return useQuery({ queryKey: queryKeys.departments.list, queryFn: listDepartments })
}

/** 부서 트리 — 실제 core-api(GET /admins/departments/tree) */
export function useDepartmentTree() {
  return useQuery({ queryKey: queryKeys.departments.tree, queryFn: getAdminDepartmentTree })
}

/** 상위 부서 검색 결과 최대 건수 — 그 밖의 부서는 검색어로 좁혀 찾는다 */
export const DEPARTMENT_SEARCH_LIMIT = 20

/**
 * 상위 부서 선택지 — 실제 core-api(GET /admins/departments?keyword=)로 부서를 이름 부분 일치로 서버 검색한다.
 * 빈 문자열이면 이름순 앞쪽 일부만 가져온다. 호출하는 쪽에서 keyword를 디바운스해서 넘긴다.
 */
export function useAdminDepartmentSearch(keyword: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.departments.adminSearch(keyword),
    queryFn: () =>
      listAdminDepartments({
        keyword,
        page: 1,
        limit: DEPARTMENT_SEARCH_LIMIT,
        sort: 'name',
        order: 'ASC',
      }),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })
}
