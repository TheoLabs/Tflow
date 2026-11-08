import * as yup from 'yup'
import { blankToNull, idToSelect, isFieldDirty, selectToId } from '../../lib/form'
import type { CreateMemberRequest, MemberDetail, UpdateMemberPatch } from '../../types/member'

/** 직원 등록·수정 공통 폼 스키마. 부서·역할 select 값 '' = 미배정 */
export const memberFormSchema = yup.object({
  name: yup.string().trim().required('이름을 입력해 주세요.').max(50, '이름은 50자 이하로 입력해 주세요.'),
  email: yup
    .string()
    .trim()
    .required('회사 이메일을 입력해 주세요.')
    .email('회사 이메일 형식이 올바르지 않습니다.'),
  employeeNumber: yup.string().trim().required('사번을 입력해 주세요.').max(20, '사번은 20자 이하로 입력해 주세요.'),
  phoneNumber: yup
    .string()
    .defined()
    .trim()
    .matches(/^[0-9-]*$/, '연락처는 숫자와 - 만 입력할 수 있습니다.'),
  joinedOn: yup.string().required('입사일을 입력해 주세요.'),
  departmentId: yup.string().defined(),
  roleId: yup.string().defined(),
})

export type MemberFormValues = yup.InferType<typeof memberFormSchema>
export type MemberFormField = keyof MemberFormValues

export const MEMBER_FORM_FIELDS: readonly MemberFormField[] = [
  'name',
  'email',
  'employeeNumber',
  'phoneNumber',
  'joinedOn',
  'departmentId',
  'roleId',
]

export const MEMBER_FIELD_LABEL: Record<MemberFormField, string> = {
  name: '이름',
  email: '회사 이메일',
  employeeNumber: '사번',
  phoneNumber: '연락처',
  joinedOn: '입사일',
  departmentId: '부서',
  roleId: '역할',
}

export const EMPTY_MEMBER_FORM: MemberFormValues = {
  name: '',
  email: '',
  employeeNumber: '',
  phoneNumber: '',
  joinedOn: '',
  departmentId: '',
  roleId: '',
}

export function toMemberFormValues(member: MemberDetail): MemberFormValues {
  return {
    name: member.name,
    email: member.email,
    employeeNumber: member.employeeNumber,
    phoneNumber: member.phoneNumber ?? '',
    joinedOn: member.joinedOn,
    departmentId: idToSelect(member.departmentId),
    roleId: idToSelect(member.roleId),
  }
}

export function toCreateMemberRequest(values: MemberFormValues): CreateMemberRequest {
  return {
    name: values.name,
    email: values.email,
    employeeNumber: values.employeeNumber,
    joinedOn: values.joinedOn,
    phoneNumber: blankToNull(values.phoneNumber),
    departmentId: selectToId(values.departmentId),
    roleId: selectToId(values.roleId),
  }
}

/**
 * dirtyFields 기준으로 바뀐 필드만 담은 patch를 만든다.
 * 키 없음 = 유지, null = 비움(연락처·부서·역할), 값 = 변경
 */
export function buildMemberPatch(
  values: MemberFormValues,
  dirtyFields: Partial<Record<MemberFormField, unknown>>,
): UpdateMemberPatch {
  const patch: UpdateMemberPatch = {}
  const changed = (field: MemberFormField) => isFieldDirty(dirtyFields[field])

  if (changed('name')) patch.name = values.name
  if (changed('email')) patch.email = values.email
  if (changed('employeeNumber')) patch.employeeNumber = values.employeeNumber
  if (changed('joinedOn')) patch.joinedOn = values.joinedOn
  if (changed('phoneNumber')) patch.phoneNumber = blankToNull(values.phoneNumber)
  if (changed('departmentId')) patch.departmentId = selectToId(values.departmentId)
  if (changed('roleId')) patch.roleId = selectToId(values.roleId)
  return patch
}
