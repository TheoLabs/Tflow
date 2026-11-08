import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // 화면 코드는 라우트 단위 lazy 로딩으로 분리돼 있다. 남는 큰 덩어리는 antd 라이브러리 자체
    // (사용 중인 컴포넌트만 트리셰이킹해도 약 1MB / gzip 약 320kB)이므로 경고 기준을 그에 맞춘다.
    chunkSizeWarningLimit: 1100,
    rolldownOptions: {
      output: {
        // 자주 바뀌지 않는 라이브러리를 화면 코드와 분리해 배포 후에도 브라우저 캐시를 살린다
        codeSplitting: {
          groups: [
            {
              name: 'vendor-react',
              test: /node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/,
              priority: 30,
            },
            {
              name: 'vendor-antd',
              test: /node_modules[\\/](antd|@ant-design|@rc-component|rc-[^\\/]+|dayjs|@emotion)[\\/]/,
              priority: 20,
            },
            { name: 'vendor', test: /node_modules[\\/]/, priority: 10 },
          ],
        },
      },
    },
  },
})
