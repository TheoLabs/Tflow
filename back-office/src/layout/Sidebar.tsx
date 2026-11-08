import { Flex, Layout, Menu, Typography, theme, type MenuProps } from 'antd'
import { Link, useLocation } from 'react-router-dom'
import { SIDER_WIDTH } from '../theme/theme'
import { MENU_GROUPS, findActiveMenuPath } from './menu'

/** menu.ts 정의 → antd Menu items (그룹 = type: 'group') */
const MENU_ITEMS: MenuProps['items'] = MENU_GROUPS.map((group) => ({
  type: 'group',
  key: `group:${group.title}`,
  label: group.title,
  children: group.items.map((item) => ({
    key: item.path,
    label: <Link to={item.path}>{item.label}</Link>,
  })),
}))

/** 왼쪽 고정 사이드바 */
export function Sidebar() {
  const { pathname } = useLocation()
  const { token } = theme.useToken()
  const active = findActiveMenuPath(pathname)

  return (
    <Layout.Sider
      width={SIDER_WIDTH}
      theme="light"
      aria-label="주 메뉴"
      style={{
        position: 'fixed',
        insetBlock: 0,
        insetInlineStart: 0,
        overflowY: 'auto',
        borderInlineEnd: `1px solid ${token.colorBorder}`,
      }}
    >
      <Flex align="center" gap={8} style={{ padding: '16px 20px 8px' }}>
        <Flex
          align="center"
          justify="center"
          aria-hidden
          style={{
            width: 24,
            height: 24,
            borderRadius: token.borderRadius,
            background: token.colorPrimary,
            color: token.colorWhite,
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          T
        </Flex>
        <Typography.Text strong style={{ fontSize: 16 }}>
          테오플로우
        </Typography.Text>
      </Flex>
      <Menu
        mode="inline"
        items={MENU_ITEMS}
        selectedKeys={active ? [active] : []}
        style={{ borderInlineEnd: 'none', paddingInline: 8 }}
      />
    </Layout.Sider>
  )
}
