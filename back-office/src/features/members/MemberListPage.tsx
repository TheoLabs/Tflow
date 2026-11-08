import { FilterOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Card, Empty, Flex, Input, Segmented, Space, Table, Tag, Tooltip, Typography } from 'antd'
import type { TableColumnsType, TableProps } from 'antd'
import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ErrorState, LoadingState } from '../../components/QueryState'
import { StatusBadge } from '../../components/StatusBadge'
import { Page } from '../../layout/Page'
import { MEMBER_STATUS_LABEL } from '../../lib/labels'
import type { AdminMemberListQuery, AdminMemberResponse, MemberStatus, SortOrder } from '../../types/member'
import { MemberCreateDrawer } from './MemberCreateDrawer'
import { useMemberList } from './queries'

/**
 * 직원 목록 — 실제 core-api(GET /admins/members) 연결.
 *
 * core-api가 지원하는 것만 연결한다: 이름·이메일·사번 통합 검색(keyword, 부분 일치), 재직 상태 탭(statuses), 페이지(page·limit), 정렬(sort·order).
 * 부서/역할 필터·미배정 집계·부서/역할 이름은 API가 없어 비활성(준비 중)으로 둔다.
 * 요약 숫자는 현재 조회 결과의 total만 쓴다(탭별 숫자를 위해 탭마다 따로 호출하지 않는다).
 * 부서·역할은 mock 데이터로 이름을 채우지 않는다 — 실제 직원과 mock 부서·역할의 id는 서로 무관하다.
 */

const PAGE_SIZE = 15
const COMING_SOON = 'core-api 지원 후 제공됩니다'
const EMPTY_VALUE = '-'

/** 정렬 가능한 컬럼 — Table 컬럼 key = core-api 엔티티 컬럼명 */
const SORTABLE_COLUMNS = ['name', 'employeeNumber', 'status'] as const
type SortableColumn = (typeof SORTABLE_COLUMNS)[number]

function isSortableColumn(value: string | null): value is SortableColumn {
  return (SORTABLE_COLUMNS as readonly string[]).includes(value ?? '')
}

/** 재직 상태 탭 — '' = 전체(statuses를 보내지 않음). 기본 탭은 전체(mock 시절 기획 그대로) */
const STATUS_TABS: { value: MemberStatus | ''; label: string }[] = [
  { value: '', label: '전체' },
  { value: 'active', label: MEMBER_STATUS_LABEL.active },
  { value: 'onLeave', label: MEMBER_STATUS_LABEL.onLeave },
  { value: 'exited', label: MEMBER_STATUS_LABEL.exited },
]

/** 탭만 걸린 빈 결과 문구 */
const EMPTY_BY_STATUS: Record<MemberStatus, string> = {
  active: '재직 중인 직원이 없습니다',
  onLeave: '휴직 중인 직원이 없습니다',
  exited: '퇴사한 직원이 없습니다',
}

function parseStatus(value: string | null): MemberStatus | undefined {
  return value === 'active' || value === 'onLeave' || value === 'exited' ? value : undefined
}

const toAntOrder = (order: SortOrder) => (order === 'ASC' ? 'ascend' : 'descend')

const emptyValue = <Typography.Text type="secondary">{EMPTY_VALUE}</Typography.Text>

/** API가 없어 아직 못 쓰는 조작 — 비활성 + 안내 툴팁 */
function ComingSoon({ children }: { children: ReactNode }) {
  return (
    <Tooltip title={COMING_SOON}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'not-allowed' }}>
        {children}
        <Tag style={{ marginInlineEnd: 0 }}>준비 중</Tag>
      </span>
    </Tooltip>
  )
}

/** URL 쿼리스트링 ↔ 목록 조건 (검색·재직 상태·정렬·페이지가 URL에 남는다) */
interface ListUrlState {
  /** URL 키는 q(mock 시절과 같음). API로는 keyword로 보낸다. 예전 email 키는 읽지 않는다 */
  q?: string
  /** URL 키는 status(단일 값). API로는 statuses=[status]로 보낸다 */
  status?: MemberStatus
  page: number
  sort?: SortableColumn
  order?: SortOrder
}

function readUrlState(params: URLSearchParams): ListUrlState {
  const page = Number(params.get('page'))
  const sort = params.get('sort')
  const order = params.get('order')
  const hasSort = isSortableColumn(sort) && (order === 'ASC' || order === 'DESC')
  return {
    q: params.get('q')?.trim() || undefined,
    status: parseStatus(params.get('status')),
    page: Number.isInteger(page) && page > 0 ? page : 1,
    sort: hasSort ? sort : undefined,
    order: hasSort ? order : undefined,
  }
}

export function MemberListPage() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const urlState = useMemo(() => readUrlState(params), [params])
  const query = useMemo<AdminMemberListQuery>(
    () => ({
      keyword: urlState.q,
      statuses: urlState.status ? [urlState.status] : undefined,
      page: urlState.page,
      limit: PAGE_SIZE,
      sort: urlState.sort,
      order: urlState.order,
    }),
    [urlState],
  )
  const [searchInput, setSearchInput] = useState(urlState.q ?? '')
  const [createOpen, setCreateOpen] = useState(false)

  const list = useMemberList(query)

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

  // 통합 검색은 부분 일치라 입력이 멈춘 뒤 300ms 후 URL(q)에 반영한다. Enter·검색 버튼·지우기는 즉시 반영.
  const currentQ = urlState.q ?? ''
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
  const applySearch = (value: string) => {
    const trimmed = value.trim()
    if (trimmed !== currentQ) updateParams({ q: trimmed || null })
  }

  const { status } = urlState
  const keyword = urlState.q
  const summaryLabel = keyword
    ? status
      ? `'${keyword}' 검색 결과 · ${MEMBER_STATUS_LABEL[status]}`
      : `'${keyword}' 검색 결과`
    : status
      ? MEMBER_STATUS_LABEL[status]
      : '전체'

  const clearSearch = () => {
    setSearchInput('')
    updateParams({ q: null })
  }
  const showAllStatuses = () => updateParams({ status: null })

  const emptyTitle = keyword
    ? status
      ? `'${keyword}' 검색 결과 중 ${MEMBER_STATUS_LABEL[status]} 직원이 없습니다`
      : `'${keyword}' 검색 결과가 없습니다`
    : status
      ? EMPTY_BY_STATUS[status]
      : '등록된 직원이 없습니다'
  const emptyHint = keyword
    ? status
      ? "다른 검색어를 입력하거나, 재직 상태를 '전체'로 바꿔 보세요."
      : '이름, 이메일, 사번의 일부로 다시 검색해 보세요.'
    : status
      ? '다른 재직 상태를 선택해 보세요.'
      : '첫 직원을 등록해 보세요.'

  const openCreate = () => setCreateOpen(true)
  const data = list.data
  const goDetail = (id: number) => navigate(`/members/${id}`)

  const sortOrderOf = (key: SortableColumn) =>
    urlState.sort === key && urlState.order ? toAntOrder(urlState.order) : null

  const columns: TableColumnsType<AdminMemberResponse> = [
    {
      key: 'name',
      title: '이름 / 회사 이메일',
      sorter: true,
      sortOrder: sortOrderOf('name'),
      render: (_, member) => (
        <Flex vertical>
          <Typography.Text strong>{member.name}</Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {member.email}
          </Typography.Text>
        </Flex>
      ),
    },
    {
      key: 'employeeNumber',
      title: '사번',
      dataIndex: 'employeeNumber',
      sorter: true,
      sortOrder: sortOrderOf('employeeNumber'),
    },
    {
      key: 'department',
      title: (
        <Tooltip title={`부서 이름은 ${COMING_SOON}`}>
          <span>부서</span>
        </Tooltip>
      ),
      render: () => emptyValue,
    },
    {
      key: 'role',
      title: (
        <Tooltip title={`역할 이름은 ${COMING_SOON}`}>
          <span>역할</span>
        </Tooltip>
      ),
      render: () => emptyValue,
    },
    {
      key: 'status',
      title: '재직 상태',
      sorter: true,
      sortOrder: sortOrderOf('status'),
      render: (_, member) => <StatusBadge status={member.status} />,
    },
  ]

  const handleTableChange: TableProps<AdminMemberResponse>['onChange'] = (pagination, _filters, sorter, extra) => {
    if (extra.action === 'paginate') {
      const page = pagination.current ?? 1
      updateParams({ page: page > 1 ? String(page) : null }, false)
      return
    }
    if (extra.action === 'sort') {
      const single = Array.isArray(sorter) ? sorter[0] : sorter
      const key = single?.columnKey != null ? String(single.columnKey) : null
      if (single?.order && isSortableColumn(key)) {
        updateParams({ sort: key, order: single.order === 'ascend' ? 'ASC' : 'DESC' })
      } else {
        updateParams({ sort: null, order: null })
      }
    }
  }

  return (
    <Page
      title="직원"
      actions={
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          직원 등록
        </Button>
      }
    >
      <Flex align="center" gap={6} style={{ minHeight: 22 }}>
        <Typography.Text type="secondary">
          {summaryLabel}{' '}
          <Typography.Text strong>{data ? `${data.total}명` : EMPTY_VALUE}</Typography.Text>
        </Typography.Text>
        <Typography.Text type="secondary">·</Typography.Text>
        <Tooltip title={`미배정 집계는 ${COMING_SOON}`}>
          <Typography.Text type="secondary" disabled>
            미배정 {EMPTY_VALUE}
          </Typography.Text>
        </Tooltip>
      </Flex>

      <Card styles={{ body: { padding: 0 } }}>
        <Flex wrap align="center" gap={12} style={{ padding: '12px 16px' }}>
          <Input.Search
            allowClear
            placeholder="이름, 이메일, 사번으로 검색"
            aria-label="이름, 이메일, 사번으로 직원 검색"
            style={{ width: 300 }}
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value)
              // 지우기(×)나 전부 지운 경우는 디바운스 없이 바로 검색 해제
              if (e.target.value.trim() === '' && currentQ) applySearch('')
            }}
            onSearch={applySearch}
          />
          <Segmented<MemberStatus | ''>
            aria-label="재직 상태"
            value={status ?? ''}
            options={STATUS_TABS}
            onChange={(value) => updateParams({ status: value || null })}
          />
          <div style={{ flex: 1 }} />
          <ComingSoon>
            <Button disabled icon={<FilterOutlined />} aria-label="부서·역할 필터 (준비 중)">
              필터
            </Button>
          </ComingSoon>
        </Flex>

        {list.isPending ? (
          <LoadingState />
        ) : list.isError ? (
          <ErrorState error={list.error} onRetry={() => void list.refetch()} />
        ) : data && data.total === 0 ? (
          <Empty
            style={{ padding: '32px 0' }}
            description={
              <Space orientation="vertical" size={4}>
                <Typography.Text strong>{emptyTitle}</Typography.Text>
                <Typography.Text type="secondary">{emptyHint}</Typography.Text>
              </Space>
            }
          >
            <Space>
              {keyword && <Button onClick={clearSearch}>검색 초기화</Button>}
              {status && <Button onClick={showAllStatuses}>전체 보기</Button>}
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
                직원 등록
              </Button>
            </Space>
          </Empty>
        ) : (
          data && (
            <Table<AdminMemberResponse>
              rowKey="id"
              columns={columns}
              dataSource={data.members}
              loading={list.isPlaceholderData}
              showSorterTooltip={false}
              onChange={handleTableChange}
              onRow={(member) => ({
                tabIndex: 0,
                style: { cursor: 'pointer' },
                onClick: () => goDetail(member.id),
                onKeyDown: (e) => e.key === 'Enter' && goDetail(member.id),
              })}
              pagination={{
                current: data.page ?? urlState.page,
                pageSize: data.limit ?? PAGE_SIZE,
                total: data.total,
                showSizeChanger: false,
                showTotal: (total, [from, to]) => `${from}–${to} / 총 ${total}명`,
                style: { paddingInline: 16 },
              }}
            />
          )
        )}
      </Card>

      {createOpen && <MemberCreateDrawer onClose={() => setCreateOpen(false)} />}
    </Page>
  )
}
