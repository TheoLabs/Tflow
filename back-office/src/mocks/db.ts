import type { Department } from '../types/department'
import type { Member, MemberStatus } from '../types/member'
import type { Permission, Role } from '../types/role'

/**
 * in-memory mock 저장소. 새로고침하면 초기화된다.
 * core-api 연동 후에는 이 폴더 전체를 지워도 된다.
 */

const SEED_TIME = '2025-01-01T00:00:00.000Z'

export function nowIso(): string {
  return new Date().toISOString()
}

// ---------- 부서 ----------
const departmentSeed: [id: number, name: string, parentId: number | null, leaderMemberId: number | null][] = [
  [1, '개발본부', null, 1],
  [2, '플랫폼팀', 1, 3],
  [3, '프로덕트팀', 1, 4],
  [4, '인프라파트', 2, 8],
  [5, '경영지원본부', null, 2],
  [6, '인사팀', 5, 5],
  [7, '재무팀', 5, 6],
  [8, '디자인팀', null, 7],
]

// ---------- 역할 ----------
const roleSeed: [id: number, name: string, description: string | null, permissions: Permission[]][] = [
  [1, '관리자', '백오피스의 모든 기능을 쓸 수 있는 관리자', ['memberRead', 'memberManage', 'departmentManage', 'roleManage']],
  [2, '인사 담당', '직원 명부와 조직 구조를 관리하는 인사 담당자', ['memberRead', 'memberManage', 'departmentManage']],
  [3, '팀장', '부서를 이끄는 팀장 — 소속 직원을 조회할 수 있다', ['memberRead']],
  [4, '개발자', '개발 직군 직책 분류', []],
  [5, '디자이너', '디자인 직군 직책 분류', []],
]

// ---------- 직원 ----------
type MemberSeed = [
  name: string,
  emailId: string,
  departmentId: number | null,
  roleId: number | null,
  status: MemberStatus,
  joinedOn: string,
  exitedOn?: string,
]

const memberSeed: MemberSeed[] = [
  ['김태오', 'taeo.kim', 1, 1, 'active', '2019-03-04'],
  ['이서연', 'seoyeon.lee', 5, 1, 'active', '2019-03-04'],
  ['박지훈', 'jihoon.park', 2, 3, 'active', '2019-07-01'],
  ['최유진', 'yujin.choi', 3, 3, 'active', '2019-09-16'],
  ['정민호', 'minho.jung', 6, 2, 'active', '2020-01-06'],
  ['강하은', 'haeun.kang', 7, 3, 'active', '2020-02-03'],
  ['조현우', 'hyunwoo.cho', 8, 3, 'active', '2020-03-02'],
  ['윤서준', 'seojun.yoon', 4, 3, 'active', '2020-05-11'],
  ['장예린', 'yerin.jang', 2, 4, 'active', '2020-06-01'],
  ['임도윤', 'doyoon.lim', 2, 4, 'active', '2020-08-03'],
  ['한지민', 'jimin.han', 2, 4, 'onLeave', '2020-10-05'],
  ['오승현', 'seunghyun.oh', 2, 4, 'active', '2021-01-04'],
  ['서다은', 'daeun.seo', 3, 4, 'active', '2021-02-01'],
  ['신준혁', 'junhyuk.shin', 3, 4, 'active', '2021-03-02'],
  ['권나연', 'nayeon.kwon', 3, 4, 'exited', '2021-03-15', '2024-06-30'],
  ['황민재', 'minjae.hwang', 3, 4, 'active', '2021-05-03'],
  ['안소희', 'sohee.ahn', 6, 2, 'active', '2021-06-01'],
  ['송재원', 'jaewon.song', 6, 2, 'onLeave', '2021-07-05'],
  ['전하린', 'harin.jeon', 7, 1, 'active', '2021-08-02'],
  ['홍성민', 'sungmin.hong', 8, 5, 'active', '2021-09-01'],
  ['유채원', 'chaewon.yoo', 8, 5, 'active', '2021-10-04'],
  ['고은비', 'eunbi.ko', 8, 5, 'exited', '2021-11-01', '2025-02-28'],
  ['문태윤', 'taeyun.moon', 4, 4, 'active', '2022-01-03'],
  ['양수빈', 'subin.yang', 4, 4, 'active', '2022-02-07'],
  ['배정우', 'jungwoo.bae', 2, 4, 'active', '2022-03-02'],
  ['백지아', 'jia.baek', 2, 4, 'active', '2022-04-04'],
  ['허건우', 'gunwoo.heo', 3, 4, 'active', '2022-05-02'],
  ['남궁민', 'min.namgoong', 3, 4, 'active', '2022-06-07'],
  ['노유나', 'yuna.noh', 3, 4, 'onLeave', '2022-07-04'],
  ['하승우', 'seungwoo.ha', 2, 4, 'exited', '2022-08-01', '2025-09-30'],
  ['곽민서', 'minseo.kwak', 8, 5, 'active', '2022-09-05'],
  ['성지호', 'jiho.sung', 4, 4, 'active', '2022-10-04'],
  ['차은우', 'eunwoo.cha', 3, 4, 'active', '2023-01-02'],
  ['주하늘', 'haneul.joo', 3, 4, 'active', '2023-02-01'],
  ['우지안', 'jian.woo', 2, 4, 'active', '2023-03-06'],
  ['구본재', 'bonjae.koo', 2, 4, 'active', '2023-04-03'],
  ['민서윤', 'seoyun.min', 6, 2, 'active', '2023-05-02'],
  ['류도현', 'dohyun.ryu', 3, 4, 'active', '2023-07-03'],
  ['나은서', 'eunseo.na', 8, 5, 'onLeave', '2023-08-01'],
  ['진우석', 'wooseok.jin', 4, 4, 'active', '2023-09-04'],
  ['지수아', 'sua.ji', 2, 4, 'active', '2024-01-02'],
  ['엄태민', 'taemin.um', 3, 4, 'active', '2024-02-05'],
  ['채윤아', 'yuna.chae', 8, 5, 'active', '2024-03-04'],
  ['원민혁', 'minhyuk.won', 2, 4, 'active', '2024-06-03'],
  ['천예준', 'yejun.cheon', 3, 4, 'exited', '2024-07-01', '2025-10-31'],
  ['방소율', 'soyul.bang', 7, 1, 'active', '2024-09-02'],
  ['기서아', 'seoa.ki', 2, 4, 'active', '2025-03-04'],
  ['마준서', 'junseo.ma', null, null, 'active', '2025-09-01'],
  ['탁지유', 'jiyu.tak', null, null, 'active', '2025-10-13'],
  ['표하준', 'hajun.pyo', null, null, 'active', '2025-11-03'],
]

function seedPhone(index: number): string | null {
  if (index % 7 === 6) return null // 일부는 연락처 없음
  const mid = String(2000 + ((index * 379) % 8000)).padStart(4, '0')
  const last = String(1000 + ((index * 7919) % 9000)).padStart(4, '0')
  return `010-${mid}-${last}`
}

function createSeed() {
  const departments: Department[] = departmentSeed.map(([id, name, parentId, leaderMemberId]) => ({
    id,
    name,
    parentId,
    leaderMemberId,
    createdAt: SEED_TIME,
    updatedAt: SEED_TIME,
  }))

  const roles: Role[] = roleSeed.map(([id, name, description, permissions]) => ({
    id,
    name,
    description,
    permissions: [...permissions],
    createdAt: SEED_TIME,
    updatedAt: SEED_TIME,
  }))

  const members: Member[] = memberSeed.map(
    ([name, emailId, departmentId, roleId, status, joinedOn, exitedOn], index) => {
      const id = index + 1
      return {
        id,
        name,
        email: `${emailId}@teoflow.com`,
        employeeNumber: `T-${String(id).padStart(4, '0')}`,
        phoneNumber: seedPhone(index),
        status,
        joinedOn,
        exitedOn: exitedOn ?? null,
        departmentId,
        roleId,
        createdAt: `${joinedOn}T09:00:00.000Z`,
        updatedAt: `${exitedOn ?? joinedOn}T09:00:00.000Z`,
      }
    },
  )

  return {
    members,
    departments,
    roles,
    nextMemberId: members.length + 1,
    nextDepartmentId: departments.length + 1,
    nextRoleId: roles.length + 1,
  }
}

export const db = createSeed()
