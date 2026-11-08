import { ApiError } from '../api/errors'
import type {
  ChangeMemberStatusRequest,
  CreateMemberRequest,
  Member,
  MemberDetail,
  MemberListItem,
  MemberListQuery,
  MemberListResponse,
  MemberStatus,
  UpdateMemberPatch,
} from '../types/member'
import { db, nowIso } from './db'
import { DATE_PATTERN, EMAIL_PATTERN, FieldErrorCollector, has, isBlank, normalize } from './validation'

const STATUS_LABEL: Record<MemberStatus, string> = { active: '재직', onLeave: '휴직', exited: '퇴사' }

/** 허용되는 재직 상태 전이 */
const ALLOWED_TRANSITIONS: Record<MemberStatus, MemberStatus[]> = {
  active: ['onLeave', 'exited'],
  onLeave: ['active', 'exited'],
  exited: ['active'],
}

function findMember(id: number): Member {
  const member = db.members.find((m) => m.id === id)
  if (!member) throw ApiError.notFound('직원을 찾을 수 없습니다.')
  return member
}

function idName(kind: 'department' | 'role', id: number | null) {
  if (id == null) return null
  const source = kind === 'department' ? db.departments : db.roles
  const found = source.find((x) => x.id === id)
  return found ? { id: found.id, name: found.name } : null
}

function toDetail(member: Member): MemberDetail {
  return {
    ...member,
    department: idName('department', member.departmentId),
    role: idName('role', member.roleId),
  }
}

function toListItem(member: Member): MemberListItem {
  return {
    id: member.id,
    name: member.name,
    email: member.email,
    employeeNumber: member.employeeNumber,
    status: member.status,
    department: idName('department', member.departmentId),
    role: idName('role', member.roleId),
  }
}

/** 등록·수정 공통 검증. selfId가 있으면 수정(자기 자신은 중복에서 제외) */
function validateFields(input: UpdateMemberPatch, selfId: number | null): void {
  const format = new FieldErrorCollector()
  const isCreate = selfId == null

  if ((isCreate || has(input, 'name')) && isBlank(input.name)) format.add('name', '이름을 입력해 주세요.')
  if (isCreate || has(input, 'email')) {
    if (isBlank(input.email)) format.add('email', '회사 이메일을 입력해 주세요.')
    else if (!EMAIL_PATTERN.test(input.email!.trim())) format.add('email', '회사 이메일 형식이 올바르지 않습니다.')
  }
  if ((isCreate || has(input, 'employeeNumber')) && isBlank(input.employeeNumber))
    format.add('employeeNumber', '사번을 입력해 주세요.')
  if (isCreate || has(input, 'joinedOn')) {
    if (isBlank(input.joinedOn)) format.add('joinedOn', '입사일을 입력해 주세요.')
    else if (!DATE_PATTERN.test(input.joinedOn!)) format.add('joinedOn', '입사일 형식이 올바르지 않습니다.')
  }
  if (input.departmentId != null && !db.departments.some((d) => d.id === input.departmentId))
    format.add('departmentId', '존재하지 않는 부서입니다.')
  if (input.roleId != null && !db.roles.some((r) => r.id === input.roleId))
    format.add('roleId', '존재하지 않는 역할입니다.')
  format.throwIfAny(400)

  const conflict = new FieldErrorCollector()
  const others = db.members.filter((m) => m.id !== selfId)
  if (input.email != null && others.some((m) => normalize(m.email) === normalize(input.email!)))
    conflict.add('email', '이미 사용 중인 회사 이메일입니다.')
  if (
    input.employeeNumber != null &&
    others.some((m) => normalize(m.employeeNumber) === normalize(input.employeeNumber!))
  )
    conflict.add('employeeNumber', '이미 사용 중인 사번입니다.')
  conflict.throwIfAny(409)
}

function emptyToNull(value: string | null | undefined): string | null {
  return value == null || value.trim() === '' ? null : value.trim()
}

export const memberStore = {
  list(query: MemberListQuery): MemberListResponse {
    const q = query.q?.trim().toLowerCase() ?? ''
    const page = Math.max(1, query.page ?? 1)
    const size = Math.max(1, query.size ?? 15)

    const filtered = db.members
      .filter((m) => {
        if (q) {
          const hit =
            m.name.toLowerCase().includes(q) ||
            m.employeeNumber.toLowerCase().includes(q) ||
            m.email.toLowerCase().includes(q)
          if (!hit) return false
        }
        if (query.status && m.status !== query.status) return false
        if (query.departmentId === 'none' && m.departmentId != null) return false
        if (typeof query.departmentId === 'number' && m.departmentId !== query.departmentId) return false
        if (query.roleId === 'none' && m.roleId != null) return false
        if (typeof query.roleId === 'number' && m.roleId !== query.roleId) return false
        return true
      })
      .sort((a, b) => b.id - a.id)

    return {
      items: filtered.slice((page - 1) * size, page * size).map(toListItem),
      total: filtered.length,
      page,
      size,
      summary: {
        total: db.members.length,
        unassigned: db.members.filter((m) => m.departmentId == null || m.roleId == null).length,
      },
    }
  },

  get(id: number): MemberDetail {
    return toDetail(findMember(id))
  },

  create(input: CreateMemberRequest): { id: number } {
    validateFields(input, null)
    const now = nowIso()
    const member: Member = {
      id: db.nextMemberId++,
      name: input.name.trim(),
      email: input.email.trim(),
      employeeNumber: input.employeeNumber.trim(),
      phoneNumber: emptyToNull(input.phoneNumber),
      status: 'active',
      joinedOn: input.joinedOn,
      exitedOn: null,
      departmentId: input.departmentId ?? null,
      roleId: input.roleId ?? null,
      createdAt: now,
      updatedAt: now,
    }
    db.members.push(member)
    return { id: member.id }
  },

  update(id: number, patch: UpdateMemberPatch): MemberDetail {
    const member = findMember(id)
    validateFields(patch, id)
    // 키 없음 = 유지, null = 비움, 값 = 변경
    if (has(patch, 'name')) member.name = patch.name!.trim()
    if (has(patch, 'email')) member.email = patch.email!.trim()
    if (has(patch, 'employeeNumber')) member.employeeNumber = patch.employeeNumber!.trim()
    if (has(patch, 'joinedOn')) member.joinedOn = patch.joinedOn!
    if (has(patch, 'phoneNumber') || patch.phoneNumber === null) member.phoneNumber = emptyToNull(patch.phoneNumber)
    if ('departmentId' in patch && patch.departmentId !== undefined) member.departmentId = patch.departmentId
    if ('roleId' in patch && patch.roleId !== undefined) member.roleId = patch.roleId
    member.updatedAt = nowIso()
    return toDetail(member)
  },

  changeStatus(id: number, request: ChangeMemberStatusRequest): MemberDetail {
    const member = findMember(id)
    const next = request.status
    if (!ALLOWED_TRANSITIONS[member.status].includes(next)) {
      throw ApiError.validation([
        {
          field: 'status',
          message: `${STATUS_LABEL[member.status]} → ${STATUS_LABEL[next]}은(는) 허용되지 않는 재직 상태 변경입니다.`,
        },
      ])
    }

    if (request.status === 'exited') {
      const errors = new FieldErrorCollector()
      if (isBlank(request.exitedOn)) errors.add('exitedOn', '퇴사일을 입력해 주세요.')
      else if (!DATE_PATTERN.test(request.exitedOn)) errors.add('exitedOn', '퇴사일 형식이 올바르지 않습니다.')
      else if (request.exitedOn < member.joinedOn) errors.add('exitedOn', '퇴사일은 입사일 이후여야 합니다.')
      errors.throwIfAny(400)

      member.exitedOn = request.exitedOn
      // 퇴사 시 이 직원이 부서장인 부서는 부서장 없음
      const now = nowIso()
      for (const department of db.departments) {
        if (department.leaderMemberId === member.id) {
          department.leaderMemberId = null
          department.updatedAt = now
        }
      }
    } else if (member.status === 'exited') {
      // 퇴사 → 재직: 퇴사일 비움
      member.exitedOn = null
    }
    // 휴직·복직 시 부서·역할은 유지된다
    member.status = next
    member.updatedAt = nowIso()
    return toDetail(member)
  },
}
