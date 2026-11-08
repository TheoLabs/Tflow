import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Alert, App, Button, Card, Flex, Typography } from 'antd'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { updateMember } from '../../api/members'
import { applyServerErrors, dirtyFieldNames } from '../../lib/form'
import { invalidateOrganization, queryKeys } from '../../lib/queryKeys'
import type { MemberDetail, UpdateMemberPatch } from '../../types/member'
import { useDepartments } from '../departments/queries'
import { useRoles } from '../roles/queries'
import { MemberFormFields } from './MemberFormFields'
import {
  MEMBER_FIELD_LABEL,
  MEMBER_FORM_FIELDS,
  buildMemberPatch,
  memberFormSchema,
  toMemberFormValues,
  type MemberFormValues,
} from './memberForm'

/** 직원 상세의 "기본 정보" — 바뀐 항목만 저장한다 */
export function MemberInfoForm({ member }: { member: MemberDetail }) {
  const queryClient = useQueryClient()
  const { message } = App.useApp()
  const departments = useDepartments()
  const roles = useRoles()

  // 서버 값이 바뀌면(다른 화면에서 수정 등) 손대지 않은 항목만 새 값으로 맞춘다
  const serverValues = useMemo(() => toMemberFormValues(member), [member])
  const form = useForm<MemberFormValues>({
    resolver: yupResolver(memberFormSchema),
    values: serverValues,
    resetOptions: { keepDirtyValues: true },
  })
  const { dirtyFields, isSubmitting } = form.formState
  const changedFields = dirtyFieldNames<MemberFormValues>(dirtyFields)

  const mutation = useMutation({
    mutationFn: (patch: UpdateMemberPatch) => updateMember(member.id, patch),
  })

  const onSubmit = form.handleSubmit(async (values) => {
    const patch = buildMemberPatch(values, form.formState.dirtyFields)
    if (Object.keys(patch).length === 0) {
      message.info('변경된 항목이 없습니다.')
      return
    }
    try {
      const updated = await mutation.mutateAsync(patch)
      queryClient.setQueryData(queryKeys.members.detail(member.id), updated)
      form.reset(toMemberFormValues(updated))
      message.success('기본 정보를 저장했습니다.')
      void invalidateOrganization(queryClient)
    } catch (error) {
      applyServerErrors(error, form.setError, MEMBER_FORM_FIELDS, (text) => message.error(text))
    }
  })

  return (
    <Card
      title="기본 정보"
      extra={
        changedFields.length > 0 && (
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            변경된 항목: {changedFields.map((f) => MEMBER_FIELD_LABEL[f]).join(', ')}
          </Typography.Text>
        )
      }
    >
      <form onSubmit={onSubmit} noValidate>
        <Alert
          type="info"
          showIcon
          title="바꾼 항목만 저장됩니다. 부서·역할을 ‘미배정’으로 고르면 비워집니다."
          style={{ marginBottom: 16 }}
        />
        <MemberFormFields
          form={form}
          departments={departments.data ?? []}
          roles={roles.data ?? []}
          showDirty
          idPrefix="member-edit"
        />
        <Flex justify="end" gap={8}>
          <Button onClick={() => form.reset(serverValues)} disabled={changedFields.length === 0 || isSubmitting}>
            되돌리기
          </Button>
          <Button type="primary" htmlType="submit" loading={isSubmitting}>
            저장
          </Button>
        </Flex>
      </form>
    </Card>
  )
}
