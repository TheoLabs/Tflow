// 임시 타입 — core-api DTO 확정 시 맞출 것
import type { IdName, Page } from './common'

export type MemberStatus = 'active' | 'onLeave' | 'exited'

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
