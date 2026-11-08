/**
 * 사이드 메뉴 정의 — 메뉴 그룹·항목은 이 배열만 고치면 된다.
 * path로 시작하는 하위 경로(예: /members/12)에서도 해당 항목이 강조된다.
 * 화면에서는 Sidebar가 이 정의를 antd Menu items로 변환한다.
 */
export interface MenuItem {
  label: string
  path: string
}

export interface MenuGroup {
  title: string
  items: MenuItem[]
}

export const MENU_GROUPS: MenuGroup[] = [
  {
    title: '조직 관리',
    items: [
      { label: '직원', path: '/members' },
      { label: '부서', path: '/departments' },
      { label: '역할', path: '/roles' },
    ],
  },
]

/** 현재 경로에 해당하는 메뉴 항목 path — 하위 경로도 상위 항목으로 본다 */
export function findActiveMenuPath(pathname: string): string | undefined {
  return MENU_GROUPS.flatMap((group) => group.items)
    .map((item) => item.path)
    .find((path) => pathname === path || pathname.startsWith(`${path}/`))
}
