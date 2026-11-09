import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { App, Button, Card, Flex, Form, Input } from 'antd'
import { useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { createDepartment } from '../../api/departments'
import { applyServerErrorCodes } from '../../lib/form'
import { fieldStatus } from '../../lib/formItem'
import { queryKeys } from '../../lib/queryKeys'
import type { IdName } from '../../types/common'
import {
  CREATE_DEPARTMENT_ERROR_FIELDS,
  DEPARTMENT_FORM_FIELDS,
  departmentFormSchema,
  emptyDepartmentForm,
  toCreateDepartmentRequest,
  type DepartmentFormValues,
} from './departmentForm'
import { LeaderMemberSelect } from './LeaderMemberSelect'
import { ParentDepartmentSelect } from './ParentDepartmentSelect'

interface DepartmentEditorProps {
  /** 미리 채울 상위 부서(트리에서 선택돼 있던 부서). null = 최상위 */
  initialParent: IdName | null
  onCancel: () => void
}

/**
 * 부서 등록 폼 — 실제 core-api(POST /admins/departments).
 * 부서 수정·삭제 API는 아직 없어, 기존 부서는 DepartmentDetail(읽기 전용)로 보여 준다.
 * 트리 · 상위 부서 선택 · 등록이 모두 실제 부서 id를 쓰므로 트리 선택을 상위 부서로 미리 채울 수 있다.
 */
export function DepartmentEditor({ initialParent, onCancel }: DepartmentEditorProps) {
  const queryClient = useQueryClient()
  const { message } = App.useApp()

  const initialValues = useMemo(() => emptyDepartmentForm(initialParent?.id ?? null), [initialParent])
  const initialParentOption = useMemo(
    () => (initialParent ? { value: String(initialParent.id), label: initialParent.name } : null),
    [initialParent],
  )
  const form = useForm<DepartmentFormValues>({
    resolver: yupResolver(departmentFormSchema),
    defaultValues: initialValues,
  })
  const { control, formState } = form
  const { errors, isSubmitting } = formState

  const createMutation = useMutation({ mutationFn: createDepartment })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await createMutation.mutateAsync(toCreateDepartmentRequest(values))
      message.success('부서가 등록되었습니다')
      // core-api가 id를 돌려주지 않아 새 부서를 자동 선택하지는 않는다. 같은 상위 아래 연속 등록하도록 폼만 초기화한다.
      form.reset(initialValues)
      // 새 부서가 트리와 상위 부서 선택지에 나타나도록 두 쿼리를 무효화한다
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.departments.tree }),
        queryClient.invalidateQueries({ queryKey: queryKeys.departments.adminSearchAll }),
      ])
    } catch (error) {
      applyServerErrorCodes(error, form.setError, CREATE_DEPARTMENT_ERROR_FIELDS, DEPARTMENT_FORM_FIELDS, (text) =>
        message.error(text),
      )
    }
  })

  return (
    <Card title="새 부서">
      <form onSubmit={onSubmit} noValidate>
        <Form layout="vertical" component={false}>
          <Form.Item
            label="부서명"
            htmlFor="dept-name"
            required
            {...fieldStatus(errors.name?.message, '부서 이름은 전체 부서에서 겹칠 수 없습니다.')}
          >
            <Controller
              control={control}
              name="name"
              render={({ field }) => <Input id="dept-name" autoComplete="off" {...field} />}
            />
          </Form.Item>
          <Form.Item
            label="상위 부서"
            htmlFor="dept-parent"
            {...fieldStatus(errors.parentId?.message, '비워 두면 최상위 부서로 등록됩니다.')}
          >
            <Controller
              control={control}
              name="parentId"
              render={({ field }) => (
                <ParentDepartmentSelect
                  id="dept-parent"
                  ref={field.ref}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  initialOption={initialParentOption}
                  status={errors.parentId ? 'error' : undefined}
                />
              )}
            />
          </Form.Item>
          <Form.Item
            label="부서장"
            htmlFor="dept-leader"
            {...fieldStatus(errors.leaderMemberId?.message, '재직 중인 직원만 지정할 수 있습니다.')}
          >
            <Controller
              control={control}
              name="leaderMemberId"
              render={({ field }) => (
                <LeaderMemberSelect
                  id="dept-leader"
                  ref={field.ref}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  status={errors.leaderMemberId ? 'error' : undefined}
                />
              )}
            />
          </Form.Item>
        </Form>
        <Flex gap={8} justify="end" wrap>
          <Button onClick={onCancel} disabled={isSubmitting}>
            취소
          </Button>
          <Button type="primary" htmlType="submit" loading={isSubmitting}>
            추가
          </Button>
        </Flex>
      </form>
    </Card>
  )
}
