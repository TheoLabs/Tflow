import { Layout } from 'antd'
import { Outlet } from 'react-router-dom'
import { SIDER_WIDTH } from '../theme/theme'
import { Sidebar } from './Sidebar'

export function AppLayout() {
  return (
    <Layout hasSider style={{ minHeight: '100%' }}>
      <Sidebar />
      <Layout style={{ marginInlineStart: SIDER_WIDTH, minWidth: 0 }}>
        <Outlet />
      </Layout>
    </Layout>
  )
}
