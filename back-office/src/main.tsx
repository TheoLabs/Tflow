import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Pretendard — 디자인 시스템에서 쓰는 굵기(400·500·600·700)만, 유니코드 범위별 동적 서브셋으로 로드
import 'pretendard/dist/web/static/Pretendard-Regular.css'
import 'pretendard/dist/web/static/Pretendard-Medium.css'
import 'pretendard/dist/web/static/Pretendard-SemiBold.css'
import 'pretendard/dist/web/static/Pretendard-Bold.css'
import './styles/global.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
