import { Tag } from 'antd'
import { MEMBER_STATUS_LABEL, MEMBER_STATUS_TONE } from '../lib/labels'
import type { MemberStatus } from '../types/member'

const TONE_TO_TAG = { success: 'success', warning: 'warning', danger: 'error' } as const

/** 재직 상태 태그 — 재직=success, 휴직=warning, 퇴사=danger */
export function StatusBadge({ status }: { status: MemberStatus }) {
  return (
    <Tag color={TONE_TO_TAG[MEMBER_STATUS_TONE[status]]} style={{ marginInlineEnd: 0 }}>
      {MEMBER_STATUS_LABEL[status]}
    </Tag>
  )
}
