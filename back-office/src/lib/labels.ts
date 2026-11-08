import type { MemberStatus } from '../types/member'
import type { Permission } from '../types/role'

export const MEMBER_STATUS_LABEL: Record<MemberStatus, string> = {
  active: '재직',
  onLeave: '휴직',
  exited: '퇴사',
}

export const MEMBER_STATUS_TONE: Record<MemberStatus, 'success' | 'warning' | 'danger'> = {
  active: 'success',
  onLeave: 'warning',
  exited: 'danger',
}

export const PERMISSION_LABEL: Record<Permission, string> = {
  memberRead: '직원 조회',
  memberManage: '직원 관리',
  departmentManage: '부서 관리',
  roleManage: '역할 관리',
}

export const PERMISSION_DESCRIPTION: Record<Permission, string> = {
  memberRead: '직원 목록·상세를 볼 수 있다',
  memberManage: '직원을 등록·수정하고 재직 상태를 바꿀 수 있다',
  departmentManage: '부서를 만들고 고치고 지울 수 있다',
  roleManage: '역할과 권한을 만들고 고치고 지울 수 있다',
}

export const UNASSIGNED_LABEL = '미배정'
