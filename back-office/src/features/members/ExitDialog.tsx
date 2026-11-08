import { yupResolver } from '@hookform/resolvers/yup'
import { Alert, DatePicker, Form, Modal } from 'antd'
import { Controller, useForm } from 'react-hook-form'
import * as yup from 'yup'
import { fromDayjs, toDayjs } from '../../lib/dateInput'
import { fieldStatus } from '../../lib/formItem'

const exitSchema = yup.object({
  exitedOn: yup.string().required('퇴사일을 입력해 주세요.'),
})
export type ExitFormValues = yup.InferType<typeof exitSchema>

interface ExitDialogProps {
  memberName: string
  joinedOn: string
  onConfirm: (values: ExitFormValues, setFieldError: (message: string) => void) => Promise<void>
  onClose: () => void
}

/** 퇴사 처리 다이얼로그 — 퇴사일 필수(입사일 이전 날짜는 고를 수 없다) */
export function ExitDialog({ memberName, joinedOn, onConfirm, onClose }: ExitDialogProps) {
  const form = useForm<ExitFormValues>({
    resolver: yupResolver(exitSchema),
    defaultValues: { exitedOn: '' },
  })
  const error = form.formState.errors.exitedOn?.message
  const pending = form.formState.isSubmitting
  const minDate = toDayjs(joinedOn)

  const submit = form.handleSubmit((values) =>
    onConfirm(values, (message) => form.setError('exitedOn', { type: 'server', message }, { shouldFocus: true })),
  )

  return (
    <Modal
      open
      title={`${memberName} 님을 퇴사 처리할까요?`}
      okText="퇴사 처리"
      cancelText="취소"
      okButtonProps={{ danger: true }}
      confirmLoading={pending}
      cancelButtonProps={{ disabled: pending }}
      closable={!pending}
      keyboard={!pending}
      mask={{ closable: !pending }}
      onOk={() => void submit()}
      onCancel={onClose}
    >
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          void submit()
        }}
      >
        <Form layout="vertical" component={false}>
          <Form.Item label="퇴사일" htmlFor="exit-date" required {...fieldStatus(error)}>
            <Controller
              control={form.control}
              name="exitedOn"
              render={({ field }) => (
                <DatePicker
                  id="exit-date"
                  ref={field.ref}
                  style={{ width: '100%' }}
                  value={toDayjs(field.value)}
                  disabledDate={(date) => (minDate ? date.isBefore(minDate, 'day') : false)}
                  onChange={(date) => field.onChange(fromDayjs(date))}
                  onBlur={field.onBlur}
                />
              )}
            />
          </Form.Item>
        </Form>
        <Alert type="warning" showIcon title="이 직원이 부서장인 부서는 부서장 없음이 됩니다." />
      </form>
    </Modal>
  )
}
