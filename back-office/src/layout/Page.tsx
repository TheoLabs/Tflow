import { ArrowLeftOutlined } from '@ant-design/icons'
import { Button, Flex, Layout, Typography, theme } from 'antd'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { TOPBAR_HEIGHT } from '../theme/theme'

interface PageProps {
  title: string
  /** 있으면 ← 뒤로 버튼을 보여 준다 */
  backTo?: string
  actions?: ReactNode
  children: ReactNode
}

/** 화면 골격 — 상단바(제목·뒤로·액션) + 본문 */
export function Page({ title, backTo, actions, children }: PageProps) {
  const navigate = useNavigate()
  const { token } = theme.useToken()
  const goBack = () => {
    // 목록에서 들어온 경우 검색·필터 상태를 살리기 위해 history back을 우선한다
    if (window.history.state?.idx > 0) navigate(-1)
    else if (backTo) navigate(backTo)
  }

  return (
    <>
      <Layout.Header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          height: TOPBAR_HEIGHT,
          lineHeight: 'normal',
          paddingInline: 24,
          borderBottom: `1px solid ${token.colorBorder}`,
        }}
      >
        {backTo && (
          <Button type="text" size="small" icon={<ArrowLeftOutlined />} onClick={goBack}>
            뒤로
          </Button>
        )}
        <Typography.Title level={3} style={{ margin: 0, flex: 1 }}>
          {title}
        </Typography.Title>
        {actions}
      </Layout.Header>
      <Layout.Content style={{ padding: 24 }}>
        <Flex vertical gap={16}>
          {children}
        </Flex>
      </Layout.Content>
    </>
  )
}
