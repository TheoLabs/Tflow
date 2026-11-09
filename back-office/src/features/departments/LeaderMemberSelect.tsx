import { Select, Spin, Typography } from 'antd'
import type { Ref } from 'react'
import { useState } from 'react'
import type { RefSelectProps } from 'antd'
import { getErrorMessage } from '../../api/errors'
import { useDebouncedValue } from '../../lib/useDebouncedValue'
import { ACTIVE_MEMBER_SEARCH_LIMIT, useActiveMemberSearch } from '../members/queries'

interface Option {
  value: string
  label: string
}

const NONE_OPTION: Option = { value: '', label: '없음' }

interface LeaderMemberSelectProps {
  id?: string
  ref?: Ref<RefSelectProps>
  /** '' = 부서장 없음, 그 외 = 직원 id 문자열 */
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  status?: 'error'
}

/**
 * 부서장 선택(실제 core-api) — 재직 직원을 서버에서 검색한다(GET /admins/members?statuses=active&keyword=).
 * 직원이 수백 명이어도 한 번에 다 받지 않고, 입력을 300ms 디바운스해 keyword로 좁힌 상위 일부만 보여 준다.
 * 고른 직원은 검색어가 바뀌어도 라벨이 유지되도록 따로 기억한다.
 * 부서 등록 폼 전용이다. 부서 수정 폼은 아직 mock 직원 선택지(useActiveMemberOptions)를 쓴다.
 */
export function LeaderMemberSelect({ id, ref, value, onChange, onBlur, status }: LeaderMemberSelectProps) {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [picked, setPicked] = useState<Option | null>(null)
  const keyword = useDebouncedValue(search.trim(), 300)

  // 드롭다운을 열었을 때만 요청한다
  const query = useActiveMemberSearch(keyword, open)
  const fetching = query.isFetching || keyword !== search.trim()

  const memberOptions: Option[] = (query.data?.members ?? []).map((member) => ({
    value: String(member.id),
    label: `${member.name} (${member.employeeNumber})`,
  }))
  const selected = value !== '' && picked?.value === value ? picked : null
  // '없음'은 검색어가 없을 때 · 현재 값이 '없음'일 때 보여 준다.
  // 고른 직원이 검색 결과에서 빠져도 라벨이 보이도록 선택지에 함께 넣어 둔다.
  const options: Option[] = [
    ...(keyword === '' || value === '' ? [NONE_OPTION] : []),
    ...(selected && !memberOptions.some((o) => o.value === selected.value) ? [selected] : []),
    ...memberOptions,
  ]

  const total = query.data?.total ?? 0
  const truncated = total > ACTIVE_MEMBER_SEARCH_LIMIT

  return (
    <Select<string, Option>
      id={id}
      ref={ref}
      value={value}
      options={options}
      status={status}
      placeholder="이름·이메일·사번으로 검색"
      showSearch={{ filterOption: false, onSearch: setSearch, searchValue: search }}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setSearch('')
      }}
      onChange={(next, option) => {
        setPicked(option && !Array.isArray(option) && next !== '' ? { value: next, label: option.label } : null)
        onChange(next ?? '')
      }}
      onBlur={onBlur}
      loading={fetching && open}
      notFoundContent={
        fetching ? (
          <Spin size="small" />
        ) : query.isError ? (
          <Typography.Text type="danger">{getErrorMessage(query.error)}</Typography.Text>
        ) : (
          '재직 중인 직원이 없습니다.'
        )
      }
      popupRender={(menu) => (
        <>
          {menu}
          {truncated && !fetching && (
            <Typography.Text type="secondary" style={{ display: 'block', padding: '4px 12px', fontSize: 12 }}>
              {total}명 중 {ACTIVE_MEMBER_SEARCH_LIMIT}명만 표시합니다. 검색어로 좁혀 주세요.
            </Typography.Text>
          )}
        </>
      )}
    />
  )
}
