import { Select, Spin, Typography } from 'antd'
import type { Ref } from 'react'
import { useState } from 'react'
import type { RefSelectProps } from 'antd'
import { getErrorMessage } from '../../api/errors'
import { useDebouncedValue } from '../../lib/useDebouncedValue'
import { DEPARTMENT_SEARCH_LIMIT, useAdminDepartmentSearch } from './queries'

interface Option {
  value: string
  label: string
}

const TOP_LEVEL_OPTION: Option = { value: '', label: '(최상위)' }

interface ParentDepartmentSelectProps {
  id?: string
  ref?: Ref<RefSelectProps>
  /** '' = 최상위(상위 부서 없음), 그 외 = 실제 core-api 부서 id 문자열 */
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  /** 미리 채운 값의 라벨(예: 트리에서 선택돼 있던 부서). 검색 결과에 없어도 이 라벨로 표시한다 */
  initialOption?: Option | null
  status?: 'error'
}

/**
 * 상위 부서 선택(실제 core-api) — 부서를 서버에서 이름으로 검색한다(GET /admins/departments?keyword=).
 * 입력을 300ms 디바운스해 keyword로 좁힌 이름순 상위 일부만 보여 준다. 드롭다운을 열었을 때만 요청한다.
 * 응답에 상위 부서 이름이 없어 경로(예: 본부 > 팀)는 표시하지 않고 부서 이름만 보여 준다.
 * 고른 부서는 검색어가 바뀌어도 라벨이 유지되도록 따로 기억한다.
 * 부서 등록 폼 전용이다. 부서 트리도 실제 core-api id라 트리에서 고른 부서를 initialOption으로 미리 채울 수 있다.
 */
export function ParentDepartmentSelect({
  id,
  ref,
  value,
  onChange,
  onBlur,
  initialOption,
  status,
}: ParentDepartmentSelectProps) {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [picked, setPicked] = useState<Option | null>(null)
  const keyword = useDebouncedValue(search.trim(), 300)

  const query = useAdminDepartmentSearch(keyword, open)
  const fetching = query.isFetching || keyword !== search.trim()

  const departmentOptions: Option[] = (query.data?.departments ?? []).map((department) => ({
    value: String(department.id),
    label: department.name,
  }))
  const selected =
    value === ''
      ? null
      : picked?.value === value
        ? picked
        : initialOption?.value === value
          ? initialOption
          : null
  // '(최상위)'는 검색어가 없을 때 · 현재 값이 최상위일 때 보여 준다.
  // 고른 부서가 검색 결과에서 빠져도 라벨이 보이도록 선택지에 함께 넣어 둔다.
  const options: Option[] = [
    ...(keyword === '' || value === '' ? [TOP_LEVEL_OPTION] : []),
    ...(selected && !departmentOptions.some((o) => o.value === selected.value) ? [selected] : []),
    ...departmentOptions,
  ]

  const total = query.data?.total ?? 0
  const truncated = total > DEPARTMENT_SEARCH_LIMIT

  return (
    <Select<string, Option>
      id={id}
      ref={ref}
      value={value}
      options={options}
      status={status}
      placeholder="부서 이름으로 검색"
      // 부서를 고른 뒤 x로 최상위(미지정)로 되돌린다. '(최상위)' 선택지로도 되돌릴 수 있다
      allowClear={value !== ''}
      showSearch={{ filterOption: false, onSearch: setSearch, searchValue: search }}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setSearch('')
      }}
      onChange={(next, option) => {
        setPicked(option && !Array.isArray(option) && next ? { value: next, label: option.label } : null)
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
          '일치하는 부서가 없습니다.'
        )
      }
      popupRender={(menu) => (
        <>
          {menu}
          {query.isError && departmentOptions.length === 0 && options.length > 0 && (
            <Typography.Text type="danger" style={{ display: 'block', padding: '4px 12px', fontSize: 12 }}>
              {getErrorMessage(query.error)}
            </Typography.Text>
          )}
          {truncated && !fetching && (
            <Typography.Text type="secondary" style={{ display: 'block', padding: '4px 12px', fontSize: 12 }}>
              {total}개 중 {DEPARTMENT_SEARCH_LIMIT}개만 표시합니다. 검색어로 좁혀 주세요.
            </Typography.Text>
          )}
        </>
      )}
    />
  )
}
