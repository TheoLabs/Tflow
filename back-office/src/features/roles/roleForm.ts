import * as yup from 'yup'
import { blankToNull, isFieldDirty } from '../../lib/form'
import { PERMISSIONS } from '../../types/role'
import type { CreateRoleRequest, Permission, RoleListItem, UpdateRolePatch } from '../../types/role'

export const roleFormSchema = yup.object({
  name: yup.string().trim().required('역할명을 입력해 주세요.').max(30, '역할명은 30자 이하로 입력해 주세요.'),
  description: yup.string().defined().trim().max(200, '설명은 200자 이하로 입력해 주세요.'),
  permissions: yup
    .array()
    .of(yup.mixed<Permission>().oneOf([...PERMISSIONS], '허용되지 않는 권한입니다.').defined())
    .defined(),
})

export type RoleFormValues = yup.InferType<typeof roleFormSchema>
export type RoleFormField = keyof RoleFormValues

export const ROLE_FORM_FIELDS: readonly RoleFormField[] = ['name', 'description', 'permissions']

export const ROLE_FIELD_LABEL: Record<RoleFormField, string> = {
  name: '역할명',
  description: '설명',
  permissions: '권한',
}

export const EMPTY_ROLE_FORM: RoleFormValues = { name: '', description: '', permissions: [] }

export function toRoleFormValues(role: RoleListItem): RoleFormValues {
  return { name: role.name, description: role.description ?? '', permissions: [...role.permissions] }
}

export function toCreateRoleRequest(values: RoleFormValues): CreateRoleRequest {
  return { name: values.name, description: blankToNull(values.description), permissions: values.permissions }
}

/** 바뀐 필드만: 키 없음 = 유지, null = 비움(설명), permissions는 바뀌면 배열 통째로 */
export function buildRolePatch(
  values: RoleFormValues,
  dirtyFields: Partial<Record<RoleFormField, unknown>>,
): UpdateRolePatch {
  const patch: UpdateRolePatch = {}
  if (isFieldDirty(dirtyFields.name)) patch.name = values.name
  if (isFieldDirty(dirtyFields.description)) patch.description = blankToNull(values.description)
  if (isFieldDirty(dirtyFields.permissions)) patch.permissions = [...values.permissions]
  return patch
}
