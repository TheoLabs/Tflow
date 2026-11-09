import * as yup from 'yup'
import { idToSelect, isFieldDirty, selectToId } from '../../lib/form'
import type {
  CreateDepartmentRequest,
  DepartmentListItem,
  UpdateDepartmentPatch,
} from '../../types/department'

/** parentId '' = 최상위, leaderMemberId '' = 부서장 없음 */
export const departmentFormSchema = yup.object({
  name: yup.string().trim().required('부서명을 입력해 주세요.').max(50, '부서명은 50자 이하로 입력해 주세요.'),
  parentId: yup.string().defined(),
  leaderMemberId: yup.string().defined(),
})

export type DepartmentFormValues = yup.InferType<typeof departmentFormSchema>
export type DepartmentFormField = keyof DepartmentFormValues

export const DEPARTMENT_FORM_FIELDS: readonly DepartmentFormField[] = ['name', 'parentId', 'leaderMemberId']

export function emptyDepartmentForm(parentId: number | null = null): DepartmentFormValues {
  return { name: '', parentId: idToSelect(parentId), leaderMemberId: '' }
}

export function toDepartmentFormValues(department: DepartmentListItem): DepartmentFormValues {
  return {
    name: department.name,
    parentId: idToSelect(department.parentId),
    leaderMemberId: idToSelect(department.leaderMemberId),
  }
}

/**
 * 등록 요청(실제 core-api). 상위 부서 값은 ParentDepartmentSelect가 실제 부서 목록 API에서 고른 id다.
 * 미지정('')인 상위 부서 · 부서장은 키를 생략한다(= 최상위 / 부서장 없음).
 */
export function toCreateDepartmentRequest(values: DepartmentFormValues): CreateDepartmentRequest {
  const request: CreateDepartmentRequest = { name: values.name }
  const parentId = selectToId(values.parentId)
  if (parentId != null) request.parentId = parentId
  const leaderMemberId = selectToId(values.leaderMemberId)
  if (leaderMemberId != null) request.leaderMemberId = leaderMemberId
  return request
}

/**
 * 부서 등록 시 core-api 오류 코드 → 표시할 폼 항목.
 * DEPARTMENT_NOT_FOUND(404)는 등록 API에서 상위 부서 id가 없을 때만 난다(고른 뒤 다른 곳에서 삭제된 경우 등).
 */
export const CREATE_DEPARTMENT_ERROR_FIELDS: Readonly<Record<string, DepartmentFormField>> = {
  DEPARTMENT_NAME_DUPLICATED: 'name',
  DEPARTMENT_NOT_FOUND: 'parentId',
  MEMBER_NOT_FOUND: 'leaderMemberId',
}

/** 바뀐 필드만: 키 없음 = 유지, null = 비움(최상위 / 부서장 없음), 값 = 변경 */
export function buildDepartmentPatch(
  values: DepartmentFormValues,
  dirtyFields: Partial<Record<DepartmentFormField, unknown>>,
): UpdateDepartmentPatch {
  const patch: UpdateDepartmentPatch = {}
  if (isFieldDirty(dirtyFields.name)) patch.name = values.name
  if (isFieldDirty(dirtyFields.parentId)) patch.parentId = selectToId(values.parentId)
  if (isFieldDirty(dirtyFields.leaderMemberId)) patch.leaderMemberId = selectToId(values.leaderMemberId)
  return patch
}
