import type { DepartmentTreeItem } from '../../types/department'
// DepartmentTreeItem: 실제 트리 API 화면 타입. mock DepartmentListItem(직원 화면)도 같은 필드를 가져 그대로 넘길 수 있다

export interface FlatTreeRow {
  department: DepartmentTreeItem
  depth: number
}

/** 평면 부서 목록을 트리 순서(깊이 우선)로 펼친다. 같은 레벨은 이름순 */
export function flattenDepartmentTree(departments: DepartmentTreeItem[]): FlatTreeRow[] {
  const byParent = new Map<number | null, DepartmentTreeItem[]>()
  const ids = new Set(departments.map((d) => d.id))
  for (const department of departments) {
    // 상위가 목록에 없는 고아 부서(또는 자기 자신을 상위로 가리키는 잘못된 데이터)는 최상위로 취급(방어)
    const key =
      department.parentId != null && department.parentId !== department.id && ids.has(department.parentId)
        ? department.parentId
        : null
    const list = byParent.get(key) ?? []
    list.push(department)
    byParent.set(key, list)
  }
  for (const list of byParent.values()) list.sort((a, b) => a.name.localeCompare(b.name, 'ko'))

  const rows: FlatTreeRow[] = []
  const visited = new Set<number>()
  const visit = (parentId: number | null, depth: number) => {
    for (const department of byParent.get(parentId) ?? []) {
      if (visited.has(department.id)) continue
      visited.add(department.id)
      rows.push({ department, depth })
      visit(department.id, depth + 1)
    }
  }
  visit(null, 0)
  // 상위 관계가 순환해 최상위에서 닿지 않는 부서도 빠뜨리지 않고 최상위로 붙인다(방어)
  for (const department of [...departments].sort((a, b) => a.name.localeCompare(b.name, 'ko'))) {
    if (visited.has(department.id)) continue
    visited.add(department.id)
    rows.push({ department, depth: 0 })
    visit(department.id, 1)
  }
  return rows
}

/** id의 모든 하위 부서 id */
export function collectDescendantIds(departments: DepartmentTreeItem[], id: number): Set<number> {
  const result = new Set<number>()
  const stack = [id]
  while (stack.length > 0) {
    const current = stack.pop()!
    for (const d of departments) {
      if (d.parentId === current && !result.has(d.id)) {
        result.add(d.id)
        stack.push(d.id)
      }
    }
  }
  return result
}

const INDENT = '　'

/** select 옵션용 들여쓰기 라벨 */
export function indentLabel(name: string, depth: number): string {
  return `${INDENT.repeat(depth)}${depth > 0 ? '└ ' : ''}${name}`
}

/** antd Select 옵션 — 부서 트리를 들여쓰기한 라벨, 값은 id 문자열 */
export function departmentSelectOptions(
  departments: DepartmentTreeItem[],
  exclude?: Set<number>,
): { value: string; label: string }[] {
  return flattenDepartmentTree(departments)
    .filter(({ department }) => !exclude?.has(department.id))
    .map(({ department, depth }) => ({ value: String(department.id), label: indentLabel(department.name, depth) }))
}

export interface DepartmentTreeNode {
  key: number
  department: DepartmentTreeItem
  children: DepartmentTreeNode[]
}

/** antd Tree용 중첩 구조 — 순서는 flattenDepartmentTree와 같다(같은 레벨 이름순) */
export function buildDepartmentTree(departments: DepartmentTreeItem[]): DepartmentTreeNode[] {
  const roots: DepartmentTreeNode[] = []
  const stack: { node: DepartmentTreeNode; depth: number }[] = []
  for (const { department, depth } of flattenDepartmentTree(departments)) {
    const node: DepartmentTreeNode = { key: department.id, department, children: [] }
    while (stack.length > 0 && stack[stack.length - 1].depth >= depth) stack.pop()
    if (stack.length === 0) roots.push(node)
    else stack[stack.length - 1].node.children.push(node)
    stack.push({ node, depth })
  }
  return roots
}
