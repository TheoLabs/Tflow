import { useMutation, useQueryClient } from '@tanstack/react-query'
import { App, Button, Card, Descriptions, Flex, Typography, type DescriptionsProps } from 'antd'
import { useState } from 'react'
import { changeMemberStatus } from '../../api/members'
import { getErrorMessage, isApiError } from '../../api/errors'
import { StatusBadge } from '../../components/StatusBadge'
import { formatDate } from '../../lib/date'
import { invalidateOrganization, queryKeys } from '../../lib/queryKeys'
import type { ChangeMemberStatusRequest, MemberDetail, MemberStatus } from '../../types/member'
import { ExitDialog } from './ExitDialog'

type StatusAction = 'leave' | 'return' | 'exit' | 'rehire'

interface ActionDef {
  key: StatusAction
  label: string
  danger?: boolean
}

/** 현재 상태에서 가능한 동작만 */
const ACTIONS: Record<MemberStatus, ActionDef[]> = {
  active: [
    { key: 'leave', label: '휴직 처리' },
    { key: 'exit', label: '퇴사 처리', danger: true },
  ],
  onLeave: [
    { key: 'return', label: '복직 처리' },
    { key: 'exit', label: '퇴사 처리', danger: true },
  ],
  exited: [{ key: 'rehire', label: '재직으로 되돌리기' }],
}

const CONFIRM_TEXT: Record<Exclude<StatusAction, 'exit'>, { title: string; body: string; confirm: string }> = {
  leave: { title: '휴직 처리할까요?', body: '재직 상태가 휴직으로 바뀝니다. 부서·역할은 그대로 유지됩니다.', confirm: '휴직 처리' },
  return: { title: '복직 처리할까요?', body: '재직 상태가 재직으로 바뀝니다. 부서·역할은 그대로 유지됩니다.', confirm: '복직 처리' },
  rehire: {
    title: '재직으로 되돌릴까요?',
    body: '재직 상태가 재직으로 바뀌고 퇴사일이 비워집니다.',
    confirm: '재직으로 되돌리기',
  },
}

const SUCCESS_TEXT: Record<StatusAction, string> = {
  leave: '휴직 처리했습니다.',
  return: '복직 처리했습니다.',
  exit: '퇴사 처리했습니다.',
  rehire: '재직으로 되돌렸습니다.',
}

export function MemberStatusCard({ member }: { member: MemberDetail }) {
  const queryClient = useQueryClient()
  const { message, modal } = App.useApp()
  const [exitOpen, setExitOpen] = useState(false)

  const mutation = useMutation({
    mutationFn: (body: ChangeMemberStatusRequest) => changeMemberStatus(member.id, body),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.members.detail(member.id), updated)
      void invalidateOrganization(queryClient)
    },
  })

  /** 휴직·복직·재직 복귀 — 확인 후 실행. 성공·실패 모두 다이얼로그를 닫는다 */
  const confirmSimple = (action: Exclude<StatusAction, 'exit'>) => {
    const text = CONFIRM_TEXT[action]
    const status: MemberStatus = action === 'leave' ? 'onLeave' : 'active'
    modal.confirm({
      title: text.title,
      content: (
        <Typography.Paragraph style={{ marginBottom: 0 }}>
          <strong>{member.name}</strong> 님 — {text.body}
        </Typography.Paragraph>
      ),
      okText: text.confirm,
      cancelText: '취소',
      onOk: async () => {
        try {
          await mutation.mutateAsync({ status })
          message.success(SUCCESS_TEXT[action])
        } catch (error) {
          message.error(getErrorMessage(error))
        }
      },
    })
  }

  const runAction = (action: StatusAction) => {
    if (action === 'exit') setExitOpen(true)
    else confirmSimple(action)
  }

  const items: DescriptionsProps['items'] = [
    { key: 'status', label: '현재 상태', children: <StatusBadge status={member.status} /> },
    { key: 'joinedOn', label: '입사일', children: formatDate(member.joinedOn) },
    ...(member.status === 'exited'
      ? [{ key: 'exitedOn', label: '퇴사일', children: formatDate(member.exitedOn) }]
      : []),
  ]

  return (
    <Card title="재직 상태">
      <Descriptions column={1} size="small" items={items} />
      <Flex vertical gap={8} style={{ marginTop: 8 }}>
        {ACTIONS[member.status].map((action) => (
          <Button key={action.key} block danger={action.danger} onClick={() => runAction(action.key)}>
            {action.label}
          </Button>
        ))}
      </Flex>

      {exitOpen && (
        <ExitDialog
          memberName={member.name}
          joinedOn={member.joinedOn}
          onClose={() => setExitOpen(false)}
          onConfirm={async ({ exitedOn }, setFieldError) => {
            try {
              await mutation.mutateAsync({ status: 'exited', exitedOn })
              message.success(SUCCESS_TEXT.exit)
              setExitOpen(false)
            } catch (error) {
              const fieldError = isApiError(error) ? error.fieldErrors.find((e) => e.field === 'exitedOn') : undefined
              if (fieldError) setFieldError(fieldError.message)
              else {
                message.error(getErrorMessage(error))
                setExitOpen(false)
              }
            }
          }}
        />
      )}
    </Card>
  )
}
