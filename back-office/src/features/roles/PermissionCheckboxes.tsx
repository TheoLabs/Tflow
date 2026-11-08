import { Checkbox, Flex, Tag, Typography, theme } from 'antd'
import { PERMISSION_DESCRIPTION, PERMISSION_LABEL } from '../../lib/labels'
import { BRAND } from '../../theme/theme'
import { PERMISSIONS, type Permission } from '../../types/role'

interface PermissionCheckboxesProps {
  value: Permission[]
  onChange: (next: Permission[]) => void
  idPrefix: string
  invalid?: boolean
}

/** 권한 체크박스 4개 + 설명. 값은 항상 정해진 순서로 유지해 dirty 비교가 순서에 흔들리지 않게 한다 */
export function PermissionCheckboxes({ value, onChange, idPrefix, invalid }: PermissionCheckboxesProps) {
  const { token } = theme.useToken()
  const toggle = (permission: Permission, checked: boolean) => {
    const set = new Set(value)
    if (checked) set.add(permission)
    else set.delete(permission)
    onChange(PERMISSIONS.filter((p) => set.has(p)))
  }

  return (
    <Flex vertical gap={8} role="group" aria-invalid={invalid || undefined}>
      {PERMISSIONS.map((permission) => {
        const checked = value.includes(permission)
        return (
          <Checkbox
            key={permission}
            id={`${idPrefix}-${permission}`}
            checked={checked}
            onChange={(e) => toggle(permission, e.target.checked)}
            style={{
              padding: '8px 12px',
              border: `1px solid ${checked ? token.colorPrimaryBorder : token.colorBorder}`,
              borderRadius: token.borderRadius,
              background: checked ? token.colorPrimaryBg : token.colorBgContainer,
            }}
          >
            <Flex vertical>
              <Typography.Text strong>{PERMISSION_LABEL[permission]}</Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {PERMISSION_DESCRIPTION[permission]}
              </Typography.Text>
            </Flex>
          </Checkbox>
        )
      })}
      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        {value.length === 0 ? '권한 없음 — 직책 분류로만 쓰입니다' : `${value.length}개 선택됨`}
      </Typography.Text>
    </Flex>
  )
}

/** 목록·상세에서 쓰는 권한 태그 묶음 — 서브 컬러 */
export function PermissionBadges({ permissions }: { permissions: Permission[] }) {
  if (permissions.length === 0) return <Tag>권한 없음</Tag>
  return (
    <Flex wrap gap={4}>
      {permissions.map((p) => (
        <Tag key={p} color={BRAND.sub} style={{ marginInlineEnd: 0 }}>
          {PERMISSION_LABEL[p]}
        </Tag>
      ))}
    </Flex>
  )
}
