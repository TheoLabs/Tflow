import { FilterOutlined, PlusOutlined } from '@ant-design/icons'
import { Badge, Button, Card, Empty, Flex, Input, Segmented, Space, Table, Tag, Typography } from 'antd'
import type { TableColumnsType } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ErrorState, LoadingState } from '../../components/QueryState'
import { StatusBadge } from '../../components/StatusBadge'
import { Page } from '../../layout/Page'
import { BRAND } from '../../theme/theme'
import { UNASSIGNED_LABEL } from '../../lib/labels'
import type { AssignmentFilter, MemberListItem, MemberListQuery, MemberStatus } from '../../types/member'
import { useDepartments } from '../departments/queries'
import { useRoles } from '../roles/queries'
import { MemberCreateDrawer } from './MemberCreateDrawer'
import { MemberFilterDrawer, type MemberFilterValues } from './MemberFilterDrawer'
import { useMemberList } from './queries'

const PAGE_SIZE = 15

const unassigned = <Typography.Text type="secondary">{UNASSIGNED_LABEL}</Typography.Text>

const COLUMNS: TableColumnsType<MemberListItem> = [
  {
    key: 'name',
    title: '이름 / 회사 이메일',
    render: (_, member) => (
      <Flex vertical>
        <Typography.Text strong>{member.name}</Typography.Text>
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {member.email}
        </Typography.Text>
      </Flex>
    ),
  },
  { key: 'employeeNumber', title: '사번', dataIndex: 'employeeNumber' },
  { key: 'department', title: '부서', render: (_, member) => member.department?.name ?? unassigned },
  { key: 'role', title: '역할', render: (_, member) => member.role?.name ?? unassigned },
  { key: 'status', title: '재직 상태', render: (_, member) => <StatusBadge status={member.status} /> },
]

const STATUS_TABS: { value: MemberStatus | ''; label: string }[] = [
  { value: '', label: '전체' },
  { value: 'active', label: '재직' },
  { value: 'onLeave', label: '휴직' },
  { value: 'exited', label: '퇴사' },
]

function parseAssignment(value: string | null): AssignmentFilter | undefined {
  if (value === 'none') return 'none'
  const id = Number(value)
  return value && Number.isInteger(id) && id > 0 ? id : undefined
}

function parseStatus(value: string | null): MemberStatus | undefined {
  return value === 'active' || value === 'onLeave' || value === 'exited' ? value : undefined
}

/** URL 쿼리스트링 ↔ 목록 조건 (검색·탭·필터·페이지가 URL에 남는다) */
function readQuery(params: URLSearchParams): Required<Pick<MemberListQuery, 'page' | 'size'>> & MemberListQuery {
  const page = Number(params.get('page'))
  return {
    q: params.get('q')?.trim() || undefined,
    status: parseStatus(params.get('status')),
    departmentId: parseAssignment(params.get('departmentId')),
    roleId: parseAssignment(params.get('roleId')),
    page: Number.isInteger(page) && page > 0 ? page : 1,
    size: PAGE_SIZE,
  }
}

export function MemberListPage() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const query = useMemo(() => readQuery(params), [params])
  const [searchInput, setSearchInput] = useState(query.q ?? '')
  const [createOpen, setCreateOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)

  const list = useMemberList(query)
  const departments = useDepartments()
  const roles = useRoles()

  /** 조건을 바꾸면 기본적으로 1페이지로 돌아간다 */
  const updateParams = (patch: Record<string, string | null>, resetPage = true) => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        for (const [key, value] of Object.entries(patch)) {
          if (value == null || value === '') next.delete(key)
          else next.set(key, value)
        }
        if (resetPage) next.delete('page')
        return next
      },
      { replace: true },
    )
  }

  // 검색어는 입력이 멈춘 뒤 300ms 후 URL에 반영
  const currentQ = query.q ?? ''
  // URL의 q가 바깥에서 바뀌면(메뉴 클릭·뒤로 가기 등) 입력창도 맞춘다 — 렌더 중 상태 보정
  const [syncedQ, setSyncedQ] = useState(currentQ)
  if (syncedQ !== currentQ) {
    setSyncedQ(currentQ)
    if (searchInput.trim() !== currentQ) setSearchInput(currentQ)
  }
  useEffect(() => {
    const trimmed = searchInput.trim()
    if (trimmed === currentQ) return
    const timer = window.setTimeout(() => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (trimmed) next.set('q', trimmed)
          else next.delete('q')
          next.delete('page')
          return next
        },
        { replace: true },
      )
    }, 300)
    return () => window.clearTimeout(timer)
  }, [searchInput, currentQ, setParams])

  const departmentName = (value: AssignmentFilter) =>
    value === 'none' ? UNASSIGNED_LABEL : (departments.data?.find((d) => d.id === value)?.name ?? `#${value}`)
  const roleName = (value: AssignmentFilter) =>
    value === 'none' ? UNASSIGNED_LABEL : (roles.data?.find((r) => r.id === value)?.name ?? `#${value}`)

  const filterValues: MemberFilterValues = {
    departmentId: query.departmentId == null ? '' : String(query.departmentId),
    roleId: query.roleId == null ? '' : String(query.roleId),
  }
  const activeFilterCount = (query.departmentId != null ? 1 : 0) + (query.roleId != null ? 1 : 0)
  const hasCondition = Boolean(query.q || query.status || activeFilterCount > 0)

  const resetConditions = () => {
    setSearchInput('')
    setParams(new URLSearchParams(), { replace: true })
  }

  const openCreate = () => setCreateOpen(true)
  const data = list.data
  const goDetail = (id: number) => navigate(`/members/${id}`)

  return (
    <Page
      title="직원"
      actions={
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          직원 등록
        </Button>
      }
    >
      <Typography.Text type="secondary" style={{ minHeight: 22 }}>
        {data && (
          <>
            전체 <Typography.Text strong>{data.summary.total}명</Typography.Text> · 미배정{' '}
            <Typography.Text strong>{data.summary.unassigned}명</Typography.Text>
          </>
        )}
      </Typography.Text>

      <Card styles={{ body: { padding: 0 } }}>
        <Flex wrap align="center" gap={12} style={{ padding: '12px 16px' }}>
          <Input.Search
            allowClear
            placeholder="이름 일부 · 사번 · 회사 이메일로 검색"
            aria-label="직원 검색"
            style={{ width: 280 }}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onSearch={(value) => {
              // Enter·검색 버튼은 300ms를 기다리지 않고 바로 반영
              const trimmed = value.trim()
              if (trimmed !== currentQ) updateParams({ q: trimmed || null })
            }}
          />
          <Segmented
            aria-label="재직 상태"
            value={query.status ?? ''}
            options={STATUS_TABS}
            onChange={(value) => updateParams({ status: value || null })}
          />
          <div style={{ flex: 1 }} />
          <Badge count={activeFilterCount} size="small" color={BRAND.main}>
            <Button icon={<FilterOutlined />} onClick={() => setFilterOpen(true)}>
              필터
            </Button>
          </Badge>
        </Flex>

        {activeFilterCount > 0 && (
          <Flex wrap align="center" gap={8} style={{ padding: '0 16px 12px' }}>
            {query.departmentId != null && (
              <Tag
                color="processing"
                closable={{ 'aria-label': '부서 필터 해제' }}
                onClose={(e) => {
                  e.preventDefault()
                  updateParams({ departmentId: null })
                }}
              >
                부서: {departmentName(query.departmentId)}
              </Tag>
            )}
            {query.roleId != null && (
              <Tag
                color="processing"
                closable={{ 'aria-label': '역할 필터 해제' }}
                onClose={(e) => {
                  e.preventDefault()
                  updateParams({ roleId: null })
                }}
              >
                역할: {roleName(query.roleId)}
              </Tag>
            )}
            <Button type="link" size="small" onClick={() => updateParams({ departmentId: null, roleId: null })}>
              필터 모두 해제
            </Button>
          </Flex>
        )}

        {list.isPending ? (
          <LoadingState />
        ) : list.isError ? (
          <ErrorState error={list.error} onRetry={() => void list.refetch()} />
        ) : data && data.total === 0 ? (
          <Empty
            style={{ padding: '32px 0' }}
            description={
              <Space orientation="vertical" size={4}>
                <Typography.Text strong>
                  {hasCondition ? '조건에 맞는 직원이 없습니다' : '등록된 직원이 없습니다'}
                </Typography.Text>
                <Typography.Text type="secondary">
                  {hasCondition ? '검색어나 필터를 바꿔 보거나 새 직원을 등록하세요.' : '첫 직원을 등록해 보세요.'}
                </Typography.Text>
              </Space>
            }
          >
            <Space>
              {hasCondition && <Button onClick={resetConditions}>조건 초기화</Button>}
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
                직원 등록
              </Button>
            </Space>
          </Empty>
        ) : (
          data && (
            <Table<MemberListItem>
              rowKey="id"
              columns={COLUMNS}
              dataSource={data.items}
              loading={list.isPlaceholderData}
              onRow={(member) => ({
                tabIndex: 0,
                style: { cursor: 'pointer' },
                onClick: () => goDetail(member.id),
                onKeyDown: (e) => e.key === 'Enter' && goDetail(member.id),
              })}
              pagination={{
                current: data.page,
                pageSize: data.size,
                total: data.total,
                showSizeChanger: false,
                showTotal: (total, [from, to]) => `${from}–${to} / 총 ${total}명`,
                style: { paddingInline: 16 },
                onChange: (page) => updateParams({ page: page > 1 ? String(page) : null }, false),
              }}
            />
          )
        )}
      </Card>

      {createOpen && <MemberCreateDrawer onClose={() => setCreateOpen(false)} />}
      {filterOpen && (
        <MemberFilterDrawer
          initial={filterValues}
          departments={departments.data ?? []}
          roles={roles.data ?? []}
          onClose={() => setFilterOpen(false)}
          onApply={(values) => {
            updateParams({ departmentId: values.departmentId || null, roleId: values.roleId || null })
            setFilterOpen(false)
          }}
        />
      )}
    </Page>
  )
}
