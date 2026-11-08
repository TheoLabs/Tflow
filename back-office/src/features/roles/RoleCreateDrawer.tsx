import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { App, Button, Drawer, Flex } from 'antd'
import { useForm } from 'react-hook-form'
import { createRole } from '../../api/roles'
import { applyServerErrors } from '../../lib/form'
import { invalidateOrganization } from '../../lib/queryKeys'
import { RoleFormFields } from './RoleFormFields'
import { EMPTY_ROLE_FORM, ROLE_FORM_FIELDS, roleFormSchema, toCreateRoleRequest, type RoleFormValues } from './roleForm'

const FORM_ID = 'role-create-form'

export function RoleCreateDrawer({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const { message } = App.useApp()
  const form = useForm<RoleFormValues>({ resolver: yupResolver(roleFormSchema), defaultValues: EMPTY_ROLE_FORM })
  const mutation = useMutation({ mutationFn: createRole })
  const pending = form.formState.isSubmitting

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const created = await mutation.mutateAsync(toCreateRoleRequest(values))
      message.success(`'${created.name}' 역할을 등록했습니다.`)
      void invalidateOrganization(queryClient)
      onClose()
    } catch (error) {
      applyServerErrors(error, form.setError, ROLE_FORM_FIELDS, (text) => message.error(text))
    }
  })

  return (
    <Drawer
      open
      title="역할 등록"
      size={440}
      onClose={onClose}
      footer={
        <Flex gap={8} justify="end">
          <Button onClick={onClose} disabled={pending}>
            취소
          </Button>
          <Button type="primary" htmlType="submit" form={FORM_ID} loading={pending}>
            등록
          </Button>
        </Flex>
      }
    >
      <form id={FORM_ID} onSubmit={onSubmit} noValidate>
        <RoleFormFields form={form} idPrefix="role-create" />
      </form>
    </Drawer>
  )
}
