import { PlusOutlined } from '@ant-design/icons'
import { Button, Card, Empty, Flex, Typography } from 'antd'
import { useState } from 'react'
import { ErrorState, LoadingState } from '../../components/QueryState'
import { Page } from '../../layout/Page'
import { useActiveMemberOptions } from '../members/queries'
import { DepartmentEditor } from './DepartmentEditor'
import { DepartmentTree } from './DepartmentTree'
import { useDepartments } from './queries'

type Selection = { mode: 'edit'; id: number } | { mode: 'create' } | null

export function DepartmentsPage() {
  const departments = useDepartments()
  const activeMembers = useActiveMemberOptions()
  const [selection, setSelection] = useState<Selection>(null)

  const list = departments.data ?? []
  const selected = selection?.mode === 'edit' ? (list.find((d) => d.id === selection.id) ?? null) : null
  const isCreate = selection?.mode === 'create'
  const startCreate = () => setSelection({ mode: 'create' })

  return (
    <Page
      title="부서"
      actions={
        <Button type="primary" icon={<PlusOutlined />} onClick={startCreate}>
          부서 추가
        </Button>
      }
    >
      {departments.isPending ? (
        <LoadingState />
      ) : departments.isError ? (
        <ErrorState error={departments.error} onRetry={() => void departments.refetch()} />
      ) : (
        // 왼쪽 트리 + 오른쪽 편집 패널 (좁은 화면에서는 위아래로 쌓인다)
        <Flex wrap gap={16} align="start">
          <Card
            title="부서 트리"
            extra={<Typography.Text type="secondary">{list.length}개</Typography.Text>}
            style={{ flex: '1 1 320px', maxWidth: 360 }}
            styles={{ body: { padding: 8 } }}
          >
            {list.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <Flex vertical gap={4}>
                    <Typography.Text strong>부서가 없습니다</Typography.Text>
                    <Typography.Text type="secondary">첫 부서를 추가해 조직을 구성하세요.</Typography.Text>
                  </Flex>
                }
              >
                <Button type="primary" icon={<PlusOutlined />} onClick={startCreate}>
                  첫 부서 추가
                </Button>
              </Empty>
            ) : (
              <DepartmentTree
                departments={list}
                selectedId={selected?.id ?? null}
                onSelect={(id) => setSelection({ mode: 'edit', id })}
              />
            )}
          </Card>

          <div style={{ flex: '1 1 480px', minWidth: 0 }}>
            {isCreate || selected ? (
              <DepartmentEditor
                key={isCreate ? 'new' : selected!.id}
                department={isCreate ? null : selected}
                departments={list}
                activeMembers={activeMembers.data ?? []}
                onDeleted={() => setSelection(null)}
                onCancelCreate={() => setSelection(null)}
              />
            ) : (
              <Card>
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    list.length === 0 ? '오른쪽 위 "부서 추가"로 시작하세요.' : '왼쪽 트리에서 부서를 선택하세요.'
                  }
                />
              </Card>
            )}
          </div>
        </Flex>
      )}
    </Page>
  )
}
