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

export function toCreateDepartmentRequest(values: DepartmentFormValues): CreateDepartmentRequest {
  return {
    name: values.name,
    parentId: selectToId(values.parentId),
    leaderMemberId: selectToId(values.leaderMemberId),
  }
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
