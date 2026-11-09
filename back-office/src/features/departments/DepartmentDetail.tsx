import { Alert, Button, Card, Descriptions, Flex, Tooltip, Typography } from 'antd'
import type { DepartmentTreeItem } from '../../types/department'

interface DepartmentDetailProps {
  department: DepartmentTreeItem
  /** 상위 부서 이름 조회용(트리 전체 목록) */
  departments: DepartmentTreeItem[]
}

const PENDING_MUTATION_HINT = '수정·삭제 API 준비 후 제공'
const LEADER_NAME_HINT = '부서장 이름은 API 지원 후 표시'

/**
 * 부서 상세(읽기 전용) — 트리 API(실제 core-api) 데이터만 보여 준다.
 * core-api에 수정·삭제 API가 없어 저장·삭제는 비활성화한다. mock 수정·삭제 함수는 호출하지 않는다
 * (트리 id는 실제 id라 mock 스토어의 부서와 맞지 않는다).
 */
export function DepartmentDetail({ department, departments }: DepartmentDetailProps) {
  const parent = department.parentId != null ? departments.find((d) => d.id === department.parentId) : undefined

  const parentLabel =
    department.parentId == null ? (
      '(최상위)'
    ) : parent ? (
      parent.name
    ) : (
      // 고아 부서: 상위 부서 id는 있지만 트리 목록에 없다 — 트리에서는 최상위로 보인다
      <Typography.Text type="warning">찾을 수 없음 (ID {department.parentId}) · 트리에서는 최상위로 표시</Typography.Text>
    )

  const leaderLabel =
    department.leaderMemberId == null ? (
      '없음'
    ) : (
      <Tooltip title={LEADER_NAME_HINT}>
        <Typography.Text style={{ cursor: 'help' }}>부서장 지정됨</Typography.Text>
      </Tooltip>
    )

  return (
    <Card title={department.name}>
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        title="읽기 전용입니다. 부서 수정·삭제는 core-api API 준비 후 제공됩니다."
      />
      <Descriptions
        column={1}
        bordered
        size="small"
        items={[
          { key: 'name', label: '부서명', children: department.name },
          { key: 'parent', label: '상위 부서', children: parentLabel },
          { key: 'leader', label: '부서장', children: leaderLabel },
          { key: 'members', label: '인원 수', children: `${department.memberCount}명` },
          { key: 'children', label: '하위 부서 수', children: `${department.childCount}개` },
        ]}
      />
      <Flex gap={8} justify="end" wrap style={{ marginTop: 16 }}>
        {/* 비활성 버튼은 마우스 이벤트를 받지 않으므로 span으로 감싸 Tooltip을 띄운다 */}
        <Tooltip title={PENDING_MUTATION_HINT}>
          <span>
            <Button danger disabled>
              삭제
            </Button>
          </span>
        </Tooltip>
        <div style={{ flex: 1 }} />
        <Tooltip title={PENDING_MUTATION_HINT}>
          <span>
            <Button type="primary" disabled>
              저장
            </Button>
          </span>
        </Tooltip>
      </Flex>
    </Card>
  )
}
