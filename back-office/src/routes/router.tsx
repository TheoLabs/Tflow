import { Flex, Spin } from 'antd'
import { Navigate, createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '../layout/AppLayout'
import { NotFoundPage } from './NotFoundPage'

/** 화면 단위 lazy 로딩 — 화면 코드는 처음 들어갈 때 받는다(레이아웃·404는 즉시 로드) */
export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    // 첫 진입 시 lazy 화면을 받는 동안 보이는 화면
    hydrateFallbackElement: (
      <Flex align="center" justify="center" style={{ height: '100%' }}>
        <Spin />
      </Flex>
    ),
    children: [
      { index: true, element: <Navigate to="/members" replace /> },
      {
        path: 'members',
        lazy: () => import('../features/members/MemberListPage').then((m) => ({ Component: m.MemberListPage })),
      },
      {
        path: 'members/:id',
        lazy: () => import('../features/members/MemberDetailPage').then((m) => ({ Component: m.MemberDetailPage })),
      },
      {
        path: 'departments',
        lazy: () => import('../features/departments/DepartmentsPage').then((m) => ({ Component: m.DepartmentsPage })),
      },
      {
        path: 'roles',
        lazy: () => import('../features/roles/RoleListPage').then((m) => ({ Component: m.RoleListPage })),
      },
      {
        path: 'roles/:id',
        lazy: () => import('../features/roles/RoleDetailPage').then((m) => ({ Component: m.RoleDetailPage })),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
