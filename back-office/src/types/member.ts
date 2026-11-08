/**
 * 직원 타입.
 * - 「core-api 실제 스펙」 블록: core-api `GET /admins/members` 기준(AdminMemberQueryDto · AdminMemberResponseDto).
 *   직원 목록 화면(/members)이 쓴다.
 * - 그 아래 나머지: 아직 mock(src/mocks)으로 동작하는 화면(상세·등록·수정·상태 변경·부서장 선택지)용 임시 타입.
 *   core-api에 해당 API가 생기면 그 DTO에 맞춘다.
 */
import type { IdName, Page } from './common'

export type MemberStatus = 'active' | 'onLeave' | 'exited'

// ─── core-api 실제 스펙: GET /admins/members ───────────────────────────────

/** 정렬 방향 — core-api OrderType */
export type SortOrder = 'ASC' | 'DESC'

/** GET /admins/members 쿼리 (AdminMemberQueryDto, 전부 선택) */
export interface AdminMemberListQuery {
  /**
   * 통합 검색어 — 이름·회사 이메일·사번 세 컬럼을 부분 일치(LIKE '%keyword%')로 OR 검색한다.
   * 검색 컬럼을 고르는 파라미터는 없다. statuses와는 AND로 조합된다.
   */
  keyword?: string
  /**
   * 재직 상태 — 이 중 하나라도 해당하면 포함(status IN (...)). 없거나 빈 배열이면 전체.
   * 쿼리는 같은 키 반복(`statuses=active&statuses=onLeave`)으로만 보낸다 — 쉼표 구분·`statuses[]`는 인식되지 않는다.
   */
  statuses?: MemberStatus[]
  page?: number
  limit?: number
  /** 엔티티 컬럼명. order와 함께 보내야 정렬이 적용된다 */
  sort?: string
  order?: SortOrder
}

/**
 * AdminMemberResponseDto — 공식 필드는 id · name · email · employeeNumber · status 다(모두 @Expose).
 * 입사일·퇴사일·부서·역할은 이 응답에 없다. 목록 화면은 부서·역할을 '-'로 둔다.
 */
export interface AdminMemberResponse {
  id: number
  name: string
  email: string
  employeeNumber: string
  status: MemberStatus
}

/** GET /admins/members 응답의 data. page·limit은 요청에 보낸 값이 그대로 돌아온다(안 보내면 없음) */
export interface AdminMemberListResponse {
  members: AdminMemberResponse[]
  total: number
  page?: number
  limit?: number
}

// ─── 이하 mock 화면용 임시 타입 ──────────────────────────────────────────

export interface Member {
  id: number
  name: string
  /** 회사 이메일 (유일) */
  email: string
  /** 사번 (유일) */
  employeeNumber: string
  phoneNumber: string | null
  status: MemberStatus
  /** 입사일 YYYY-MM-DD */
  joinedOn: string
  /** 퇴사일 YYYY-MM-DD — 퇴사일 때만 값이 있다 */
  exitedOn: string | null
  /** null = 부서 미배정 */
  departmentId: number | null
  /** null = 역할 미배정 */
  roleId: number | null
  createdAt: string
  updatedAt: string
}

/** 직원 상세 조회 응답 */
export interface MemberDetail extends Member {
  department: IdName | null
  role: IdName | null
}

/** 직원 목록의 한 행 */
export interface MemberListItem {
  id: number
  name: string
  email: string
  employeeNumber: string
  status: MemberStatus
  department: IdName | null
  role: IdName | null
}

/** 부서·역할 필터에서 'none' = 미배정 */
export type AssignmentFilter = number | 'none'

export interface MemberListQuery {
  /** 이름 일부 · 사번 · 회사 이메일 */
  q?: string
  status?: MemberStatus
  departmentId?: AssignmentFilter
  roleId?: AssignmentFilter
  page?: number
  size?: number
}

export interface MemberListResponse extends Page<MemberListItem> {
  /** 필터와 무관한 전체 집계 — 전체 인원, 부서 또는 역할이 미배정인 인원 */
  summary: { total: number; unassigned: number }
}

export interface CreateMemberRequest {
  name: string
  email: string
  employeeNumber: string
  joinedOn: string
  phoneNumber?: string | null
  departmentId?: number | null
  roleId?: number | null
}

/**
 * 직원 수정(부분 업데이트) — 키 없음 = 유지, null = 비움, 값 = 변경.
 * 재직 상태는 이 요청이 아니라 상태 변경 요청으로 바꾼다.
 */
export interface UpdateMemberPatch {
  name?: string
  email?: string
  employeeNumber?: string
  phoneNumber?: string | null
  joinedOn?: string
  departmentId?: number | null
  roleId?: number | null
}

export type ChangeMemberStatusRequest =
  | { status: 'active' }
  | { status: 'onLeave' }
  | { status: 'exited'; exitedOn: string }
