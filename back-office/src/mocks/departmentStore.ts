import { ApiError } from '../api/errors'
import type {
  CreateDepartmentRequest,
  Department,
  DepartmentDeleteImpact,
  DepartmentListItem,
  UpdateDepartmentPatch,
} from '../types/department'
import { db, nowIso } from './db'
import { FieldErrorCollector, has, isBlank, normalize } from './validation'

function findDepartment(id: number): Department {
  const department = db.departments.find((d) => d.id === id)
  if (!department) throw ApiError.notFound('부서를 찾을 수 없습니다.')
  return department
}

/** id의 모든 하위 부서 id */
function descendantIds(id: number): Set<number> {
  const result = new Set<number>()
  const stack = [id]
  while (stack.length > 0) {
    const current = stack.pop()!
    for (const child of db.departments.filter((d) => d.parentId === current)) {
      if (!result.has(child.id)) {
        result.add(child.id)
        stack.push(child.id)
      }
    }
  }
  return result
}

function toListItem(department: Department): DepartmentListItem {
  const leader = db.members.find((m) => m.id === department.leaderMemberId)
  return {
    ...department,
    leader: leader ? { id: leader.id, name: leader.name } : null,
    memberCount: db.members.filter((m) => m.departmentId === department.id).length,
    childCount: db.departments.filter((d) => d.parentId === department.id).length,
  }
}

/**
 * 생성·수정 공통 검증. 최종 상태(name, parentId, leaderMemberId)를 받아 검사한다.
 * leaderChanged가 false면 기존 부서장은 다시 검사하지 않는다(휴직 전환된 부서장 유지 허용).
 */
function validate(
  selfId: number | null,
  next: { name: string; parentId: number | null; leaderMemberId: number | null },
  checks: { name: boolean; parent: boolean; leader: boolean },
): void {
  const errors = new FieldErrorCollector()

  if (checks.name && isBlank(next.name)) errors.add('name', '부서명을 입력해 주세요.')

  if (checks.parent && next.parentId != null) {
    if (!db.departments.some((d) => d.id === next.parentId)) {
      errors.add('parentId', '존재하지 않는 상위 부서입니다.')
    } else if (selfId != null && (next.parentId === selfId || descendantIds(selfId).has(next.parentId))) {
      errors.add('parentId', '자기 자신이나 하위 부서를 상위 부서로 지정할 수 없습니다.')
    }
  }

  if (checks.leader && next.leaderMemberId != null) {
    const leader = db.members.find((m) => m.id === next.leaderMemberId)
    if (!leader) errors.add('leaderMemberId', '존재하지 않는 직원입니다.')
    else if (leader.status !== 'active') errors.add('leaderMemberId', '부서장은 재직 중인 직원만 지정할 수 있습니다.')
  }
  errors.throwIfAny(400)

  if ((checks.name || checks.parent) && !isBlank(next.name)) {
    const duplicated = db.departments.some(
      (d) => d.id !== selfId && d.parentId === next.parentId && normalize(d.name) === normalize(next.name),
    )
    if (duplicated) {
      const conflict = new FieldErrorCollector()
      conflict.add('name', '같은 상위 부서 아래에 같은 이름의 부서가 있습니다.')
      conflict.throwIfAny(409)
    }
  }
}

export const departmentStore = {
  list(): DepartmentListItem[] {
    return [...db.departments].sort((a, b) => a.id - b.id).map(toListItem)
  },

  create(input: CreateDepartmentRequest): DepartmentListItem {
    const next = {
      name: input.name?.trim() ?? '',
      parentId: input.parentId ?? null,
      leaderMemberId: input.leaderMemberId ?? null,
    }
    validate(null, next, { name: true, parent: true, leader: true })
    const now = nowIso()
    const department: Department = { id: db.nextDepartmentId++, ...next, createdAt: now, updatedAt: now }
    db.departments.push(department)
    return toListItem(department)
  },

  update(id: number, patch: UpdateDepartmentPatch): DepartmentListItem {
    const department = findDepartment(id)
    // 키 없음 = 유지, null = 비움, 값 = 변경
    const next = {
      name: has(patch, 'name') ? patch.name!.trim() : department.name,
      parentId: patch.parentId !== undefined ? patch.parentId : department.parentId,
      leaderMemberId: patch.leaderMemberId !== undefined ? patch.leaderMemberId : department.leaderMemberId,
    }
    validate(id, next, {
      name: patch.name !== undefined,
      parent: patch.parentId !== undefined,
      leader: patch.leaderMemberId !== undefined,
    })
    Object.assign(department, next, { updatedAt: nowIso() })
    return toListItem(department)
  },

  deleteImpact(id: number): DepartmentDeleteImpact {
    findDepartment(id)
    return {
      memberCount: db.members.filter((m) => m.departmentId === id).length,
      childCount: db.departments.filter((d) => d.parentId === id).length,
    }
  },

  /** 소속 직원은 미배정, 하위 부서는 지운 부서의 상위로 이동 — 하나라도 실패하면 아무것도 바꾸지 않는다 */
  remove(id: number): void {
    const department = findDepartment(id)
    const children = db.departments.filter((d) => d.parentId === id)
    const siblings = db.departments.filter((d) => d.id !== id && d.parentId === department.parentId)
    const clash = children.find((child) => siblings.some((s) => normalize(s.name) === normalize(child.name)))
    if (clash) {
      throw new ApiError(
        409,
        `하위 부서 '${clash.name}'을(를) 옮길 위치에 같은 이름의 부서가 있어 삭제할 수 없습니다. 먼저 이름을 바꿔 주세요.`,
      )
    }

    const now = nowIso()
    for (const member of db.members) {
      if (member.departmentId === id) {
        member.departmentId = null
        member.updatedAt = now
      }
    }
    for (const child of children) {
      child.parentId = department.parentId
      child.updatedAt = now
    }
    db.departments = db.departments.filter((d) => d.id !== id)
  },
}
