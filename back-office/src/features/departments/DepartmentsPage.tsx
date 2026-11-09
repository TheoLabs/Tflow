import { PlusOutlined } from '@ant-design/icons'
import { Button, Card, Empty, Flex, Typography } from 'antd'
import { useState } from 'react'
import { ErrorState, LoadingState } from '../../components/QueryState'
import { Page } from '../../layout/Page'
import type { IdName } from '../../types/common'
import { DepartmentDetail } from './DepartmentDetail'
import { DepartmentEditor } from './DepartmentEditor'
import { DepartmentTree } from './DepartmentTree'
import { useDepartmentTree } from './queries'

/** view: 트리에서 고른 부서(읽기 전용) · create: 등록 폼(상위 부서 미리 채움) */
type Selection = { mode: 'view'; id: number } | { mode: 'create'; parent: IdName | null } | null

export function DepartmentsPage() {
  const departments = useDepartmentTree()
  const [selection, setSelection] = useState<Selection>(null)

  const list = departments.data ?? []
  // 무효화 후 사라진 부서를 가리키면 선택 없음으로 본다
  const selected = selection?.mode === 'view' ? (list.find((d) => d.id === selection.id) ?? null) : null
  const createParent = selection?.mode === 'create' ? selection.parent : undefined

  // 트리에서 부서가 선택돼 있으면 그 부서를 상위 부서로 미리 채운다(트리 · 등록 모두 실제 core-api id)
  const startCreate = () =>
    setSelection({ mode: 'create', parent: selected ? { id: selected.id, name: selected.name } : null })

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
        // 왼쪽 트리 + 오른쪽 패널 (좁은 화면에서는 위아래로 쌓인다)
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
                    <Typography.Text type="secondary">첫 부서를 추가하세요.</Typography.Text>
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
                onSelect={(id) => setSelection({ mode: 'view', id })}
              />
            )}
          </Card>

          <div style={{ flex: '1 1 480px', minWidth: 0 }}>
            {createParent !== undefined ? (
              <DepartmentEditor
                key={`new-${createParent?.id ?? 'root'}`}
                initialParent={createParent}
                onCancel={() => setSelection(null)}
              />
            ) : selected ? (
              <DepartmentDetail key={selected.id} department={selected} departments={list} />
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
