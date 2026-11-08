import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Alert, App, Button, Card, Col, Empty, Flex, Result, Row, Space, Typography } from 'antd'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { getErrorMessage, isNotFound } from '../../api/errors'
import { deleteRole, updateRole } from '../../api/roles'
import { ErrorState, LoadingState } from '../../components/QueryState'
import { StatusBadge } from '../../components/StatusBadge'
import { Page } from '../../layout/Page'
import { applyServerErrors, dirtyFieldNames } from '../../lib/form'
import { UNASSIGNED_LABEL } from '../../lib/labels'
import { invalidateOrganization, queryKeys } from '../../lib/queryKeys'
import type { RoleDetail, UpdateRolePatch } from '../../types/role'
import { RoleFormFields } from './RoleFormFields'
import { useRole } from './queries'
import {
  ROLE_FIELD_LABEL,
  ROLE_FORM_FIELDS,
  buildRolePatch,
  roleFormSchema,
  toRoleFormValues,
  type RoleFormValues,
} from './roleForm'

export function RoleDetailPage() {
  const params = useParams()
  const navigate = useNavigate()
  const id = Number(params.id)
  const validId = Number.isInteger(id) && id > 0
  const query = useRole(validId ? id : Number.NaN)
  const notFound = !validId || isNotFound(query.error)

  return (
    <Page title="역할 상세" backTo="/roles">
      {notFound ? (
        <Result
          status="404"
          title="역할을 찾을 수 없습니다"
          subTitle="삭제되었거나 잘못된 주소일 수 있습니다."
          extra={
            <Button type="primary" onClick={() => navigate('/roles')}>
              역할 목록으로
            </Button>
          }
        />
      ) : query.isPending ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => void query.refetch()} />
      ) : (
        <Row gutter={[16, 16]} align="top">
          <Col xs={24} xl={16}>
            <RoleEditForm key={query.data.id} role={query.data} />
          </Col>
          <Col xs={24} xl={8}>
            <AssignedMembers role={query.data} />
          </Col>
        </Row>
      )}
    </Page>
  )
}

function RoleEditForm({ role }: { role: RoleDetail }) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { message, modal } = App.useApp()

  const serverValues = useMemo(() => toRoleFormValues(role), [role])
  const form = useForm<RoleFormValues>({
    resolver: yupResolver(roleFormSchema),
    values: serverValues,
    resetOptions: { keepDirtyValues: true },
  })
  const { dirtyFields, isSubmitting } = form.formState
  const changedFields = dirtyFieldNames<RoleFormValues>(dirtyFields)

  const updateMutation = useMutation({ mutationFn: (patch: UpdateRolePatch) => updateRole(role.id, patch) })
  const deleteMutation = useMutation({ mutationFn: () => deleteRole(role.id) })

  const onSubmit = form.handleSubmit(async (values) => {
    const patch = buildRolePatch(values, form.formState.dirtyFields)
    if (Object.keys(patch).length === 0) {
      message.info('변경된 항목이 없습니다.')
      return
    }
    try {
      const updated = await updateMutation.mutateAsync(patch)
      form.reset(toRoleFormValues(updated))
      message.success('역할을 저장했습니다.')
      void invalidateOrganization(queryClient)
    } catch (error) {
      applyServerErrors(error, form.setError, ROLE_FORM_FIELDS, (text) => message.error(text))
    }
  })

  /** 삭제 확인 — 배정 인원이 미배정이 된다는 영향을 함께 안내한다. 성공·실패 모두 다이얼로그를 닫는다 */
  const openDelete = () =>
    modal.confirm({
      title: `'${role.name}' 역할을 삭제할까요?`,
      content: (
        <Space orientation="vertical" size={4}>
          <Typography.Text>
            배정된 직원 <strong>{role.memberCount}명</strong>은 역할 미배정이 됩니다.
          </Typography.Text>
          <Typography.Text>삭제한 역할은 되돌릴 수 없습니다.</Typography.Text>
        </Space>
      ),
      okText: '삭제',
      cancelText: '취소',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteMutation.mutateAsync()
          message.success(`'${role.name}' 역할을 삭제했습니다.`)
          queryClient.removeQueries({ queryKey: queryKeys.roles.detail(role.id) })
          await invalidateOrganization(queryClient)
          navigate('/roles', { replace: true })
        } catch (error) {
          message.error(getErrorMessage(error))
        }
      },
    })

  return (
    <Card
      title={role.name}
      extra={
        changedFields.length > 0 && (
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            변경된 항목: {changedFields.map((f) => ROLE_FIELD_LABEL[f]).join(', ')}
          </Typography.Text>
        )
      }
    >
      <form onSubmit={onSubmit} noValidate>
        <Alert
          type="info"
          showIcon
          title="바꾼 항목만 저장됩니다. 권한은 바꾸면 선택한 목록 그대로 저장됩니다."
          style={{ marginBottom: 16 }}
        />
        <RoleFormFields form={form} idPrefix="role-edit" showDirty />
        <Flex gap={8}>
          <Button danger onClick={openDelete} disabled={isSubmitting}>
            삭제
          </Button>
          <div style={{ flex: 1 }} />
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

function AssignedMembers({ role }: { role: RoleDetail }) {
  const navigate = useNavigate()
  return (
    <Card title={`배정된 직원 ${role.members.length}명`} styles={{ body: { padding: role.members.length ? 8 : 24 } }}>
      {role.members.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <Flex vertical gap={4}>
              <Typography.Text strong>배정된 직원이 없습니다</Typography.Text>
              <Typography.Text type="secondary">직원 상세에서 이 역할을 배정할 수 있습니다.</Typography.Text>
            </Flex>
          }
        />
      ) : (
        <Flex vertical gap={2}>
          {role.members.map((member) => (
            <Button
              key={member.id}
              type="text"
              block
              onClick={() => navigate(`/members/${member.id}`)}
              style={{ justifyContent: 'flex-start', height: 'auto', paddingBlock: 8 }}
            >
              <Flex align="center" gap={8} style={{ width: '100%' }}>
                <Typography.Text strong>{member.name}</Typography.Text>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {member.departmentName ?? `부서 ${UNASSIGNED_LABEL}`}
                </Typography.Text>
                <div style={{ flex: 1 }} />
                {member.status !== 'active' && <StatusBadge status={member.status} />}
              </Flex>
            </Button>
          ))}
        </Flex>
      )}
    </Card>
  )
}
