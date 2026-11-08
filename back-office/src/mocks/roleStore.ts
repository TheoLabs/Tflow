import { ApiError } from '../api/errors'
import { PERMISSIONS } from '../types/role'
import type { CreateRoleRequest, Role, RoleDetail, RoleListItem, UpdateRolePatch } from '../types/role'
import { db, nowIso } from './db'
import { FieldErrorCollector, has, isBlank, normalize } from './validation'

function findRole(id: number): Role {
  const role = db.roles.find((r) => r.id === id)
  if (!role) throw ApiError.notFound('역할을 찾을 수 없습니다.')
  return role
}

function toListItem(role: Role): RoleListItem {
  return { ...role, memberCount: db.members.filter((m) => m.roleId === role.id).length }
}

/** 정해진 순서로 정렬·중복 제거 */
function canonicalPermissions(values: readonly string[]): Role['permissions'] {
  return PERMISSIONS.filter((p) => values.includes(p))
}

function validate(selfId: number | null, input: UpdateRolePatch, isCreate: boolean): void {
  const errors = new FieldErrorCollector()
  if ((isCreate || input.name !== undefined) && isBlank(input.name)) errors.add('name', '역할명을 입력해 주세요.')
  if (input.permissions !== undefined) {
    const invalid = input.permissions.filter((p) => !(PERMISSIONS as readonly string[]).includes(p))
    if (invalid.length > 0) errors.add('permissions', `허용되지 않는 권한입니다: ${invalid.join(', ')}`)
  }
  errors.throwIfAny(400)

  if (input.name !== undefined) {
    const duplicated = db.roles.some((r) => r.id !== selfId && normalize(r.name) === normalize(input.name!))
    if (duplicated) {
      const conflict = new FieldErrorCollector()
      conflict.add('name', '이미 있는 역할명입니다.')
      conflict.throwIfAny(409)
    }
  }
}

export const roleStore = {
  list(): RoleListItem[] {
    return [...db.roles].sort((a, b) => a.id - b.id).map(toListItem)
  },

  get(id: number): RoleDetail {
    const role = findRole(id)
    const members = db.members
      .filter((m) => m.roleId === id)
      .map((m) => ({
        id: m.id,
        name: m.name,
        status: m.status,
        departmentName: db.departments.find((d) => d.id === m.departmentId)?.name ?? null,
      }))
    return { ...toListItem(role), members }
  },

  create(input: CreateRoleRequest): RoleListItem {
    validate(null, input, true)
    const now = nowIso()
    const role: Role = {
      id: db.nextRoleId++,
      name: input.name.trim(),
      description: isBlank(input.description) ? null : input.description!.trim(),
      permissions: canonicalPermissions(input.permissions ?? []),
      createdAt: now,
      updatedAt: now,
    }
    db.roles.push(role)
    return toListItem(role)
  },

  update(id: number, patch: UpdateRolePatch): RoleListItem {
    const role = findRole(id)
    validate(id, patch, false)
    // 키 없음 = 유지, null = 비움, 값 = 변경 (permissions는 통째로 교체)
    if (has(patch, 'name')) role.name = patch.name!.trim()
    if (patch.description !== undefined)
      role.description = isBlank(patch.description) ? null : patch.description!.trim()
    if (patch.permissions !== undefined) role.permissions = canonicalPermissions(patch.permissions)
    role.updatedAt = nowIso()
    return toListItem(role)
  },

  /** 배정 직원은 역할 미배정 */
  remove(id: number): void {
    findRole(id)
    const now = nowIso()
    for (const member of db.members) {
      if (member.roleId === id) {
        member.roleId = null
        member.updatedAt = now
      }
    }
    db.roles = db.roles.filter((r) => r.id !== id)
  },
}
