import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { App as AntApp, ConfigProvider } from 'antd'
import koKR from 'antd/locale/ko_KR'
import dayjs from 'dayjs'
import 'dayjs/locale/ko'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes/router'
import { appTheme } from './theme/theme'

// DatePicker 등 날짜 표시는 한국어
dayjs.locale('ko')

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) => {
        // 찾을 수 없음 등 4xx는 재시도하지 않는다
        const status = (error as { status?: number }).status
        if (status && status >= 400 && status < 500) return false
        return failureCount < 1
      },
      refetchOnWindowFocus: false,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={appTheme} locale={koKR}>
        {/* App: message·modal·notification을 테마·로케일 컨텍스트 안에서 쓰기 위한 래퍼(App.useApp) */}
        <AntApp>
          <RouterProvider router={router} />
        </AntApp>
      </ConfigProvider>
    </QueryClientProvider>
  )
}
