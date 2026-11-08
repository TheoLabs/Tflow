import { Button, Result } from 'antd'
import { useNavigate } from 'react-router-dom'
import { Page } from '../layout/Page'

export function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <Page title="페이지를 찾을 수 없습니다">
      <Result
        status="404"
        title="요청한 화면이 없습니다"
        subTitle="주소가 바뀌었거나 잘못 입력되었을 수 있습니다."
        extra={
          <Button type="primary" onClick={() => navigate('/members')}>
            직원 목록으로
          </Button>
        }
      />
    </Page>
  )
}
