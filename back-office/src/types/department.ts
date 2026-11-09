// 임시 타입 — core-api DTO 확정 시 맞출 것
import type { IdName } from './common'
import type { SortOrder } from './member'

export interface Department {
  id: number
  /** 같은 상위 부서 아래에서 유일 */
  name: string
  /** null = 최상위 */
  parentId: number | null
  /** null = 부서장 없음. 재직 직원만 */
  leaderMemberId: number | null
  createdAt: string
  updatedAt: string
}

/** 부서 목록(평면) — 프론트에서 트리로 조립한다 */
export interface DepartmentListItem extends Department {
  leader: IdName | null
  /** 소속 직원 수(재직 상태 무관) */
  memberCount: number
  /** 바로 아래 하위 부서 수 */
  childCount: number
}

/**
 * 부서 등록 입력(화면 기준 이름). API 함수(createDepartment)가 core-api 필드명으로 바꿔 보낸다.
 * 키 없음 · null = 미지정.
 */
export interface CreateDepartmentRequest {
  name: string
  parentId?: number | null
  leaderMemberId?: number | null
}

/**
 * [core-api 실제 스펙] POST /admins/departments 요청 body (DepartmentCreateDto).
 * - name: 전체 부서에서 유일(같은 상위 부서 안에서만이 아니다)
 * - parentDepartmentId · leaderMemberId: 생략 또는 null = 미지정
 * 성공 응답은 `{ data: {} }` — 생성된 id를 돌려주지 않는다.
 */
export interface AdminCreateDepartmentBody {
  name: string
  parentDepartmentId?: number | null
  leaderMemberId?: number | null
}

/** 부서 수정(부분 업데이트) — 키 없음 = 유지, null = 비움(최상위 / 부서장 없음), 값 = 변경 */
export interface UpdateDepartmentPatch {
  name?: string
  parentId?: number | null
  leaderMemberId?: number | null
}

/** 삭제 전 영향 조회 */
export interface DepartmentDeleteImpact {
  memberCount: number
  childCount: number
}

/**
 * [core-api 실제 스펙] GET /admins/departments 쿼리 (AdminDepartmentQueryDto = PaginationDto + keyword). 모두 선택.
 * - keyword: 부서 이름 부분 일치(LIKE)
 * - page · limit: 둘 다 생략하면 페이지 나눔 없이 전체를 돌려준다
 * - sort · order: 둘 다 있을 때만 정렬한다. 기본 정렬이 없다
 */
export interface AdminDepartmentListQuery {
  keyword?: string
  page?: number
  limit?: number
  /** 엔티티 컬럼명(예: 'name') */
  sort?: string
  order?: SortOrder
}

/**
 * GET /admins/departments 목록 항목. core-api가 응답 DTO 없이 엔티티를 그대로 돌려준다(공식 DTO 아님).
 * 감사 필드(createdAt 등)는 select: false라 오지 않는다. 확실한 네 필드만 정의한다.
 * 상위 부서 이름 · 부서장 이름 · 소속 인원 · 하위 부서 수는 응답에 없다.
 */
export interface AdminDepartment {
  id: number
  name: string
  /** null = 최상위 */
  parentDepartmentId: number | null
  /** null = 부서장 없음 */
  leaderMemberId: number | null
}

/** GET /admins/departments 응답의 data */
export interface AdminDepartmentListResponse {
  departments: AdminDepartment[]
  total: number
  /** 요청에 page를 보냈을 때만 */
  page?: number
  /** 요청에 limit을 보냈을 때만 */
  limit?: number
}

/**
 * [core-api 실제 스펙] GET /admins/departments/tree 응답 data의 항목. data는 배열 그 자체다(페이지 나눔 없음, 전체).
 * - 정렬이 보장되지 않는다(형제 정렬은 프론트에서 이름순).
 * - 부서장 이름(leader)은 오지 않는다. leaderMemberId만 온다.
 * - memberCount: 소속 직원 수. 현재 퇴사자까지 포함한 수다(core-api 쪽 이슈, 화면에서 보정하지 않는다).
 * - childCount는 없다 — 프론트에서 계산한다.
 */
export interface AdminDepartmentTreeItem {
  id: number
  name: string
  /** null = 최상위 */
  parentDepartmentId: number | null
  /** null = 부서장 없음 */
  leaderMemberId: number | null
  memberCount: number
}

/**
 * 부서 트리 화면 타입(실제 core-api 트리 기준). 부서장은 id만 있다(이름을 얻는 API가 없다).
 * mock DepartmentListItem도 이 모양을 만족하므로 tree.ts 함수를 함께 쓴다.
 */
export interface DepartmentTreeItem {
  id: number
  name: string
  /** null = 최상위 */
  parentId: number | null
  /** null = 부서장 없음 */
  leaderMemberId: number | null
  /** 소속 직원 수(현재 퇴사자 포함) */
  memberCount: number
  /** 바로 아래 하위 부서 수 — 프론트 계산 */
  childCount: number
}

function toNullableId(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

/**
 * 트리 응답 → 화면 타입. 쓰는 필드만 골라 담고(추가 필드는 무시), childCount를 계산한다.
 * childCount는 목록 안에서 parentId가 그 부서인 항목 수다. 상위가 목록에 없는 고아 부서는
 * 트리 조립(tree.ts) 단계에서 최상위로 올라간다.
 */
export function normalizeDepartmentTree(items: readonly AdminDepartmentTreeItem[] | null | undefined): DepartmentTreeItem[] {
  if (!Array.isArray(items)) return []
  const base = items
    .filter((d) => d != null && typeof d.id === 'number')
    .map((d) => ({
      id: d.id,
      name: typeof d.name === 'string' ? d.name : String(d.name ?? ''),
      parentId: toNullableId(d.parentDepartmentId),
      leaderMemberId: toNullableId(d.leaderMemberId),
      memberCount: typeof d.memberCount === 'number' ? d.memberCount : Number(d.memberCount) || 0,
    }))
  const childCounts = new Map<number, number>()
  for (const d of base) {
    if (d.parentId != null && d.parentId !== d.id) childCounts.set(d.parentId, (childCounts.get(d.parentId) ?? 0) + 1)
  }
  return base.map((d) => ({ ...d, childCount: childCounts.get(d.id) ?? 0 }))
}
