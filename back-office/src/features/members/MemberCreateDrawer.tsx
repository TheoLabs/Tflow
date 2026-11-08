import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Alert, App, Button, Drawer, Flex } from 'antd'
import { useForm } from 'react-hook-form'
import { createMember } from '../../api/members'
import { applyServerErrors } from '../../lib/form'
import { invalidateOrganization } from '../../lib/queryKeys'
import { useDepartments } from '../departments/queries'
import { useRoles } from '../roles/queries'
import { MemberFormFields } from './MemberFormFields'
import {
  EMPTY_MEMBER_FORM,
  MEMBER_FORM_FIELDS,
  memberFormSchema,
  toCreateMemberRequest,
  type MemberFormValues,
} from './memberForm'

const FORM_ID = 'member-create-form'

/** 직원 등록 드로어 — 열 때마다 마운트되므로 폼은 항상 빈 상태로 시작한다 */
export function MemberCreateDrawer({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const { message } = App.useApp()
  const departments = useDepartments()
  const roles = useRoles()

  const form = useForm<MemberFormValues>({
    resolver: yupResolver(memberFormSchema),
    defaultValues: EMPTY_MEMBER_FORM,
  })

  const mutation = useMutation({ mutationFn: createMember })

  const submit = (keepOpen: boolean) =>
    form.handleSubmit(async (values) => {
      try {
        await mutation.mutateAsync(toCreateMemberRequest(values))
      } catch (error) {
        applyServerErrors(error, form.setError, MEMBER_FORM_FIELDS, (text) => message.error(text))
        return
      }
      message.success(`${values.name} 님을 등록했습니다.`)
      void invalidateOrganization(queryClient)
      if (keepOpen) {
        form.reset(EMPTY_MEMBER_FORM)
        form.setFocus('name')
      } else {
        onClose()
      }
    })

  const pending = form.formState.isSubmitting

  return (
    <Drawer
      open
      title="직원 등록"
      size={440}
      onClose={onClose}
      footer={
        <Flex gap={8}>
          <Button onClick={onClose} disabled={pending}>
            취소
          </Button>
          <div style={{ flex: 1 }} />
          <Button onClick={submit(true)} disabled={pending}>
            등록 후 계속
          </Button>
          <Button type="primary" htmlType="submit" form={FORM_ID} loading={pending}>
            등록
          </Button>
        </Flex>
      }
    >
      <form id={FORM_ID} onSubmit={submit(false)} noValidate>
        <Alert
          type="info"
          showIcon
          title="등록한 직원은 재직 상태로 시작합니다. 부서·역할은 나중에 배정해도 됩니다."
          style={{ marginBottom: 16 }}
        />
        <MemberFormFields
          form={form}
          departments={departments.data ?? []}
          roles={roles.data ?? []}
          idPrefix="member-create"
        />
      </form>
    </Drawer>
  )
}
