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
 * 등록 요청(실제 core-api). 상위 부서는 보내지 않는다 — 선택지가 mock 부서 id라 실제 서버에 없기 때문이다.
 * 부서 목록 API가 생기기 전까지는 최상위 부서로만 등록된다.
 */
export function toCreateDepartmentRequest(values: DepartmentFormValues): CreateDepartmentRequest {
  return {
    name: values.name,
    leaderMemberId: selectToId(values.leaderMemberId),
  }
}

/** 부서 등록 시 core-api 오류 코드 → 표시할 폼 항목 */
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
