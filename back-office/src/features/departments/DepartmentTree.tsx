import { Flex, Tree, Typography, type TreeDataNode } from 'antd'
import { useMemo, useState } from 'react'
import type { DepartmentTreeItem } from '../../types/department'
import { buildDepartmentTree, type DepartmentTreeNode } from './tree'

interface DepartmentTreeProps {
  departments: DepartmentTreeItem[]
  selectedId: number | null
  onSelect: (id: number) => void
}

function toTreeData(nodes: DepartmentTreeNode[]): TreeDataNode[] {
  return nodes.map(({ key, department, children }) => ({
    key,
    title: (
      <Flex justify="space-between" gap={8}>
        <Typography.Text ellipsis>{department.name}</Typography.Text>
        <Typography.Text type="secondary" aria-label={`소속 ${department.memberCount}명`} style={{ flex: 'none' }}>
          {department.memberCount}명
        </Typography.Text>
      </Flex>
    ),
    children: toTreeData(children),
  }))
}

/** 부서 트리 — 기본은 모두 펼침. 사용자가 접은 부서만 기억해, 새로 생긴 부서도 펼쳐진 채로 보인다 */
export function DepartmentTree({ departments, selectedId, onSelect }: DepartmentTreeProps) {
  const treeData = useMemo(() => toTreeData(buildDepartmentTree(departments)), [departments])
  const [collapsed, setCollapsed] = useState<Set<number>>(() => new Set())
  const expandedKeys = departments.map((d) => d.id).filter((id) => !collapsed.has(id))

  return (
    <Tree
      aria-label="부서 트리"
      blockNode
      showLine
      treeData={treeData}
      expandedKeys={expandedKeys}
      onExpand={(keys) => {
        const open = new Set(keys.map(Number))
        setCollapsed(new Set(departments.map((d) => d.id).filter((id) => !open.has(id))))
      }}
      selectedKeys={selectedId == null ? [] : [selectedId]}
      // 이미 선택된 부서를 다시 눌러도 선택을 풀지 않는다
      onSelect={(_, info) => onSelect(Number(info.node.key))}
    />
  )
}
