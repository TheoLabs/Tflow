import { Flex, Tag } from 'antd'
import type { FormItemProps } from 'antd'
import type { ReactNode } from 'react'

/**
 * react-hook-form 상태 → antd Form.Item 표시 props.
 * 검증·상태 관리는 react-hook-form이 하고, Form.Item은 라벨·에러 표시만 맡는다.
 * - error가 있으면 validateStatus='error' + help=에러 문구
 * - 없으면 hint를 help로(보조 설명)
 */
export function fieldStatus(error: string | undefined, hint?: ReactNode): Pick<FormItemProps, 'validateStatus' | 'help'> {
  return error ? { validateStatus: 'error', help: error } : { help: hint }
}

/** 수정 화면에서 바뀐 항목 라벨 옆에 '변경됨' 표시 */
export function dirtyLabel(label: string, dirty: boolean | undefined): ReactNode {
  if (!dirty) return label
  return (
    <Flex align="center" gap={6}>
      {label}
      <Tag color="processing" variant="filled" style={{ marginInlineEnd: 0, fontSize: 12, lineHeight: '18px' }}>
        변경됨
      </Tag>
    </Flex>
  )
}
