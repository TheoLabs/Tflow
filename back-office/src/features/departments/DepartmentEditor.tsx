import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { App, Button, Card, Flex, Form, Input, Select, Space, Typography } from 'antd'
import { useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import {
  createDepartment,
  deleteDepartment,
  getDepartmentDeleteImpact,
  updateDepartment,
} from '../../api/departments'
import { getErrorMessage } from '../../api/errors'
import { applyServerErrors, dirtyFieldNames, isFieldDirty } from '../../lib/form'
import { dirtyLabel, fieldStatus } from '../../lib/formItem'
import { invalidateOrganization } from '../../lib/queryKeys'
import type { DepartmentListItem, UpdateDepartmentPatch } from '../../types/department'
import type { MemberListItem } from '../../types/member'
import {
  DEPARTMENT_FORM_FIELDS,
  buildDepartmentPatch,
  departmentFormSchema,
  emptyDepartmentForm,
  toCreateDepartmentRequest,
  toDepartmentFormValues,
  type DepartmentFormValues,
} from './departmentForm'
import { collectDescendantIds, departmentSelectOptions } from './tree'

interface DepartmentEditorProps {
  /** 없으면 새 부서 모드 */
  department: DepartmentListItem | null
  departments: DepartmentListItem[]
  activeMembers: MemberListItem[]
  onCreated: (id: number) => void
  onDeleted: () => void
  onCancelCreate: () => void
}

export function DepartmentEditor({
  department,
  departments,
  activeMembers,
  onCreated,
  onDeleted,
  onCancelCreate,
}: DepartmentEditorProps) {
  const isCreate = department == null
  const queryClient = useQueryClient()
  const { message, modal } = App.useApp()
  const navigate = useNavigate()

  const serverValues = useMemo(
    () => (department ? toDepartmentFormValues(department) : emptyDepartmentForm()),
    [department],
  )
  const form = useForm<DepartmentFormValues>({
    resolver: yupResolver(departmentFormSchema),
    values: serverValues,
    resetOptions: { keepDirtyValues: true },
  })
  const { control, formState } = form
  const { errors, dirtyFields, isSubmitting } = formState
  const dirty = (field: keyof DepartmentFormValues) => !isCreate && isFieldDirty(dirtyFields[field])
  const hasChanges = dirtyFieldNames<DepartmentFormValues>(dirtyFields).length > 0

  // 상위 부서 선택지: 자기 자신 · 하위 부서 제외
  const excludedParents = useMemo(() => {
    if (!department) return new Set<number>()
    const ids = collectDescendantIds(departments, department.id)
    ids.add(department.id)
    return ids
  }, [department, departments])

  // 부서장 선택지: 재직 직원만. 현재 부서장이 재직이 아니면(예: 휴직) 현재 값 유지를 위해 함께 보여 준다
  const leaderMissing =
    department?.leader != null && !activeMembers.some((m) => m.id === department.leader!.id)

  const saveMutation = useMutation({
    mutationFn: async (values: DepartmentFormValues) => {
      if (isCreate) return createDepartment(toCreateDepartmentRequest(values))
      const patch: UpdateDepartmentPatch = buildDepartmentPatch(values, form.formState.dirtyFields)
      if (Object.keys(patch).length === 0) return null
      return updateDepartment(department.id, patch)
    },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const saved = await saveMutation.mutateAsync(values)
      if (saved == null) {
        message.info('변경된 항목이 없습니다.')
        return
      }
      await invalidateOrganization(queryClient)
      if (isCreate) {
        message.success(`'${saved.name}' 부서를 추가했습니다.`)
        onCreated(saved.id)
      } else {
        form.reset(toDepartmentFormValues(saved))
        message.success('부서를 저장했습니다.')
      }
    } catch (error) {
      applyServerErrors(error, form.setError, DEPARTMENT_FORM_FIELDS, (text) => message.error(text))
    }
  })

  // ---------- 삭제: 영향(미배정 인원·하위 부서)을 먼저 조회해 안내한 뒤 확인받는다 ----------
  const impactMutation = useMutation({ mutationFn: getDepartmentDeleteImpact })
  const deleteMutation = useMutation({ mutationFn: deleteDepartment })

  const parentName = department?.parentId
    ? (departments.find((d) => d.id === department.parentId)?.name ?? null)
    : null

  const openDelete = async () => {
    if (!department) return
    let impact
    try {
      impact = await impactMutation.mutateAsync(department.id)
    } catch (error) {
      message.error(getErrorMessage(error))
      return
    }
    modal.confirm({
      title: `'${department.name}' 부서를 삭제할까요?`,
      content: (
        <Space orientation="vertical" size={4}>
          <Typography.Text>
            소속 직원 <strong>{impact.memberCount}명</strong>은 부서 미배정이 됩니다.
          </Typography.Text>
          <Typography.Text>
            하위 부서 <strong>{impact.childCount}개</strong>는 한 단계 위로 올라갑니다
            {impact.childCount > 0 && <> ({parentName ? `'${parentName}' 아래` : '최상위'}로 이동)</>}.
          </Typography.Text>
          <Typography.Text>삭제한 부서는 되돌릴 수 없습니다.</Typography.Text>
        </Space>
      ),
      okText: '삭제',
      cancelText: '취소',
      okButtonProps: { danger: true },
      // 성공·실패 모두 다이얼로그를 닫는다(실패는 메시지로 알림)
      onOk: async () => {
        try {
          await deleteMutation.mutateAsync(department.id)
          message.success(`'${department.name}' 부서를 삭제했습니다.`)
          await invalidateOrganization(queryClient)
          onDeleted()
        } catch (error) {
          message.error(getErrorMessage(error))
        }
      },
    })
  }

  const parentOptions = [{ value: '', label: '(최상위)' }, ...departmentSelectOptions(departments, excludedParents)]
  const leaderOptions = [
    { value: '', label: '없음' },
    ...(leaderMissing ? [{ value: String(department.leader!.id), label: `${department.leader!.name} (재직 아님)` }] : []),
    ...activeMembers.map((member) => ({
      value: String(member.id),
      label: `${member.name} · ${member.employeeNumber} (${member.department?.name ?? '부서 미배정'})`,
    })),
  ]

  return (
    <Card
      title={isCreate ? '새 부서' : department.name}
      extra={
        !isCreate && (
          <Space size={12}>
            <Typography.Text type="secondary">소속 {department.memberCount}명</Typography.Text>
            <Typography.Text type="secondary">하위 부서 {department.childCount}개</Typography.Text>
          </Space>
        )
      }
    >
      <form onSubmit={onSubmit} noValidate>
        <Form layout="vertical" component={false}>
          <Form.Item
            label={dirtyLabel('부서명', dirty('name'))}
            htmlFor="dept-name"
            required
            {...fieldStatus(errors.name?.message, '같은 상위 부서 아래에서는 이름이 겹칠 수 없습니다.')}
          >
            <Controller
              control={control}
              name="name"
              render={({ field }) => <Input id="dept-name" autoComplete="off" {...field} />}
            />
          </Form.Item>
          <Form.Item
            label={dirtyLabel('상위 부서', dirty('parentId'))}
            htmlFor="dept-parent"
            {...fieldStatus(errors.parentId?.message, isCreate ? undefined : '자기 자신과 하위 부서는 고를 수 없습니다.')}
          >
            <Controller
              control={control}
              name="parentId"
              render={({ field }) => (
                <Select
                  id="dept-parent"
                  ref={field.ref}
                  options={parentOptions}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
          </Form.Item>
          <Form.Item
            label={dirtyLabel('부서장', dirty('leaderMemberId'))}
            htmlFor="dept-leader"
            {...fieldStatus(errors.leaderMemberId?.message, '재직 중인 직원만 지정할 수 있습니다.')}
          >
            <Controller
              control={control}
              name="leaderMemberId"
              render={({ field }) => (
                <Select
                  id="dept-leader"
                  ref={field.ref}
                  options={leaderOptions}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
          </Form.Item>
        </Form>
        <Flex gap={8} justify="end" wrap>
          {isCreate ? (
            <>
              <Button onClick={onCancelCreate} disabled={isSubmitting}>
                취소
              </Button>
              <Button type="primary" htmlType="submit" loading={isSubmitting}>
                추가
              </Button>
            </>
          ) : (
            <>
              <Button
                danger
                onClick={() => void openDelete()}
                loading={impactMutation.isPending}
                disabled={isSubmitting}
              >
                삭제
              </Button>
              <div style={{ flex: 1 }} />
              <Button onClick={() => navigate(`/members?departmentId=${department.id}`)}>소속 직원 보기</Button>
              <Button onClick={() => form.reset(serverValues)} disabled={!hasChanges || isSubmitting}>
                되돌리기
              </Button>
              <Button type="primary" htmlType="submit" loading={isSubmitting}>
                저장
              </Button>
            </>
          )}
        </Flex>
      </form>
    </Card>
  )
}
