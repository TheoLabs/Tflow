// 임시 타입 — core-api DTO 확정 시 맞출 것
import type { IdName } from './common'

export interface Department {
  id: number
  /** 같은 상위 부서 아래에서 유일 */
  name: string
  /** null = 최상위 */
  parentId: number | null
  /** null = 부서장 없음. 재직 직원만 */
  leaderMemberId: number | null
  createdAt: string
  updatedAt: string
}

/** 부서 목록(평면) — 프론트에서 트리로 조립한다 */
export interface DepartmentListItem extends Department {
  leader: IdName | null
  /** 소속 직원 수(재직 상태 무관) */
  memberCount: number
  /** 바로 아래 하위 부서 수 */
  childCount: number
}

/**
 * 부서 등록 입력(화면 기준 이름). API 함수(createDepartment)가 core-api 필드명으로 바꿔 보낸다.
 * 키 없음 · null = 미지정.
 */
export interface CreateDepartmentRequest {
  name: string
  parentId?: number | null
  leaderMemberId?: number | null
}

/**
 * [core-api 실제 스펙] POST /admins/departments 요청 body (DepartmentCreateDto).
 * - name: 전체 부서에서 유일(같은 상위 부서 안에서만이 아니다)
 * - parentDepartmentId · leaderMemberId: 생략 또는 null = 미지정
 * 성공 응답은 `{ data: {} }` — 생성된 id를 돌려주지 않는다.
 */
export interface AdminCreateDepartmentBody {
  name: string
  parentDepartmentId?: number | null
  leaderMemberId?: number | null
}

/** 부서 수정(부분 업데이트) — 키 없음 = 유지, null = 비움(최상위 / 부서장 없음), 값 = 변경 */
export interface UpdateDepartmentPatch {
  name?: string
  parentId?: number | null
  leaderMemberId?: number | null
}

/** 삭제 전 영향 조회 */
export interface DepartmentDeleteImpact {
  memberCount: number
  childCount: number
}
