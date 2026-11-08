// 임시 타입 — core-api DTO 확정 시 맞출 것
import type { MemberStatus } from './member'

export const PERMISSIONS = ['memberRead', 'memberManage', 'departmentManage', 'roleManage'] as const

export type Permission = (typeof PERMISSIONS)[number]

export interface Role {
  id: number
  /** 유일 */
  name: string
  description: string | null
  /** 빈 배열 = 권한 없음(직책 분류로만 쓰임) */
  permissions: Permission[]
  createdAt: string
  updatedAt: string
}

export interface RoleListItem extends Role {
  /** 배정 인원(재직 상태 무관) */
  memberCount: number
}

export interface RoleAssignedMember {
  id: number
  name: string
  departmentName: string | null
  status: MemberStatus
}

export interface RoleDetail extends RoleListItem {
  members: RoleAssignedMember[]
}

export interface CreateRoleRequest {
  name: string
  description?: string | null
  permissions: Permission[]
}

/** 역할 수정(부분 업데이트) — 키 없음 = 유지, null = 비움(설명), permissions는 보내면 배열 통째로 교체 */
export interface UpdateRolePatch {
  name?: string
  description?: string | null
  permissions?: Permission[]
}
