import { PlusOutlined } from '@ant-design/icons'
import { Button, Card, Empty, Flex, Table, Typography } from 'antd'
import type { TableColumnsType } from 'antd'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ErrorState, LoadingState } from '../../components/QueryState'
import { Page } from '../../layout/Page'
import type { RoleListItem } from '../../types/role'
import { PermissionBadges } from './PermissionCheckboxes'
import { RoleCreateDrawer } from './RoleCreateDrawer'
import { useRoles } from './queries'

const COLUMNS: TableColumnsType<RoleListItem> = [
  { key: 'name', title: '역할명', render: (_, role) => <Typography.Text strong>{role.name}</Typography.Text> },
  {
    key: 'description',
    title: '설명',
    width: 320,
    ellipsis: true,
    render: (_, role) => role.description ?? '-',
  },
  { key: 'permissions', title: '권한', render: (_, role) => <PermissionBadges permissions={role.permissions} /> },
  { key: 'memberCount', title: '배정 인원', width: 100, align: 'right', render: (_, role) => `${role.memberCount}명` },
]

export function RoleListPage() {
  const navigate = useNavigate()
  const roles = useRoles()
  const [createOpen, setCreateOpen] = useState(false)
  const openCreate = () => setCreateOpen(true)
  const goDetail = (id: number) => navigate(`/roles/${id}`)

  return (
    <Page
      title="역할"
      actions={
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          역할 등록
        </Button>
      }
    >
      <Card styles={{ body: { padding: 0 } }}>
        {roles.isPending ? (
          <LoadingState />
        ) : roles.isError ? (
          <ErrorState error={roles.error} onRetry={() => void roles.refetch()} />
        ) : roles.data.length === 0 ? (
          <Empty
            style={{ padding: '32px 0' }}
            description={
              <Flex vertical gap={4}>
                <Typography.Text strong>등록된 역할이 없습니다</Typography.Text>
                <Typography.Text type="secondary">역할을 만들고 권한을 골라 직원에게 배정하세요.</Typography.Text>
              </Flex>
            }
          >
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              첫 역할 등록
            </Button>
          </Empty>
        ) : (
          <Table<RoleListItem>
            rowKey="id"
            columns={COLUMNS}
            dataSource={roles.data}
            pagination={false}
            onRow={(role) => ({
              tabIndex: 0,
              style: { cursor: 'pointer' },
              onClick: () => goDetail(role.id),
              onKeyDown: (e) => e.key === 'Enter' && goDetail(role.id),
            })}
          />
        )}
      </Card>
      {createOpen && <RoleCreateDrawer onClose={() => setCreateOpen(false)} />}
    </Page>
  )
}
