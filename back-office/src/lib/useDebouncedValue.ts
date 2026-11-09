import { useEffect, useState } from 'react'

/** value가 delay(ms) 동안 바뀌지 않으면 그 값을 돌려준다 — 서버 검색 요청을 줄이는 용도 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(timer)
  }, [value, delay])
  return debounced
}
