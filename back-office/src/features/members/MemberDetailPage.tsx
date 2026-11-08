import { Avatar, Button, Card, Col, Flex, Result, Row, Typography, theme } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import { isNotFound } from '../../api/errors'
import { ErrorState, LoadingState } from '../../components/QueryState'
import { StatusBadge } from '../../components/StatusBadge'
import { Page } from '../../layout/Page'
import { MemberInfoForm } from './MemberInfoForm'
import { MemberStatusCard } from './MemberStatusCard'
import { useMember } from './queries'

export function MemberDetailPage() {
  const params = useParams()
  const navigate = useNavigate()
  const { token } = theme.useToken()
  const id = Number(params.id)
  const validId = Number.isInteger(id) && id > 0
  const query = useMember(validId ? id : Number.NaN)

  const notFound = !validId || isNotFound(query.error)

  return (
    <Page title="직원 상세" backTo="/members">
      {notFound ? (
        <Result
          status="404"
          title="직원을 찾을 수 없습니다"
          subTitle="삭제되었거나 잘못된 주소일 수 있습니다."
          extra={
            <Button type="primary" onClick={() => navigate('/members')}>
              직원 목록으로
            </Button>
          }
        />
      ) : query.isPending ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => void query.refetch()} />
      ) : (
        <>
          <Card styles={{ body: { padding: '16px 24px' } }}>
            <Flex align="center" gap={16}>
              <Avatar
                size={48}
                aria-hidden
                style={{ background: token.colorPrimaryBg, color: token.colorPrimary, fontSize: 18, fontWeight: 700 }}
              >
                {query.data.name.slice(0, 1)}
              </Avatar>
              <Flex vertical gap={4}>
                <Flex align="center" gap={8}>
                  <Typography.Title level={2} style={{ margin: 0 }}>
                    {query.data.name}
                  </Typography.Title>
                  <StatusBadge status={query.data.status} />
                </Flex>
                <Typography.Text type="secondary">
                  {query.data.employeeNumber} · {query.data.email}
                </Typography.Text>
              </Flex>
            </Flex>
          </Card>
          <Row gutter={[16, 16]} align="top">
            <Col xs={24} xl={16}>
              <MemberInfoForm key={query.data.id} member={query.data} />
            </Col>
            <Col xs={24} xl={8}>
              <MemberStatusCard member={query.data} />
            </Col>
          </Row>
        </>
      )}
    </Page>
  )
}
