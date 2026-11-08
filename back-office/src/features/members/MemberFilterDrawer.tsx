import { Button, Drawer, Flex, Form, Select } from 'antd'
import { useState } from 'react'
import { UNASSIGNED_LABEL } from '../../lib/labels'
import type { DepartmentListItem } from '../../types/department'
import type { RoleListItem } from '../../types/role'
import { departmentSelectOptions } from '../departments/tree'

/** select 값: '' = 전체, 'none' = 미배정, 숫자 문자열 = id */
export interface MemberFilterValues {
  departmentId: string
  roleId: string
}

interface MemberFilterDrawerProps {
  initial: MemberFilterValues
  departments: DepartmentListItem[]
  roles: RoleListItem[]
  onApply: (values: MemberFilterValues) => void
  onClose: () => void
}

const BASE_OPTIONS = [
  { value: '', label: '전체' },
  { value: 'none', label: UNASSIGNED_LABEL },
]

/** 부서·역할 필터 드로어 — 적용을 눌러야 목록에 반영된다 */
export function MemberFilterDrawer({ initial, departments, roles, onApply, onClose }: MemberFilterDrawerProps) {
  const [draft, setDraft] = useState<MemberFilterValues>(initial)

  return (
    <Drawer
      open
      title="필터"
      size={360}
      onClose={onClose}
      footer={
        <Flex gap={8}>
          <Button onClick={() => setDraft({ departmentId: '', roleId: '' })}>초기화</Button>
          <div style={{ flex: 1 }} />
          <Button type="primary" onClick={() => onApply(draft)}>
            적용
          </Button>
        </Flex>
      }
    >
      <Form layout="vertical" component={false}>
        <Form.Item label="부서" htmlFor="filter-department">
          <Select
            id="filter-department"
            value={draft.departmentId}
            options={[...BASE_OPTIONS, ...departmentSelectOptions(departments)]}
            onChange={(departmentId) => setDraft((prev) => ({ ...prev, departmentId }))}
          />
        </Form.Item>
        <Form.Item label="역할" htmlFor="filter-role">
          <Select
            id="filter-role"
            value={draft.roleId}
            options={[...BASE_OPTIONS, ...roles.map((role) => ({ value: String(role.id), label: role.name }))]}
            onChange={(roleId) => setDraft((prev) => ({ ...prev, roleId }))}
          />
        </Form.Item>
      </Form>
    </Drawer>
  )
}
