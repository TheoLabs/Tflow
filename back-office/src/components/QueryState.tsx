import { Button, Flex, Result, Spin, Typography } from 'antd'
import { getErrorMessage } from '../api/errors'

export function LoadingState({ label = '불러오는 중…' }: { label?: string }) {
  return (
    <Flex role="status" vertical align="center" justify="center" gap={12} style={{ padding: 48 }}>
      <Spin />
      <Typography.Text type="secondary">{label}</Typography.Text>
    </Flex>
  )
}

/** API 호출 실패의 공통 표시 */
export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <Result
      status="error"
      title="데이터를 불러오지 못했습니다"
      subTitle={getErrorMessage(error)}
      extra={onRetry && <Button onClick={onRetry}>다시 시도</Button>}
    />
  )
}
