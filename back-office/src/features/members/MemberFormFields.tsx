import { Col, DatePicker, Form, Input, Row, Select } from 'antd'
import { Controller, type UseFormReturn } from 'react-hook-form'
import { fromDayjs, toDayjs } from '../../lib/dateInput'
import { isFieldDirty } from '../../lib/form'
import { dirtyLabel, fieldStatus } from '../../lib/formItem'
import { UNASSIGNED_LABEL } from '../../lib/labels'
import type { DepartmentListItem } from '../../types/department'
import type { RoleListItem } from '../../types/role'
import { departmentSelectOptions } from '../departments/tree'
import { MEMBER_FIELD_LABEL, type MemberFormField, type MemberFormValues } from './memberForm'

interface MemberFormFieldsProps {
  form: UseFormReturn<MemberFormValues>
  departments: DepartmentListItem[]
  roles: RoleListItem[]
  /** 수정 화면에서 바뀐 항목에 '변경됨' 표시 */
  showDirty?: boolean
  idPrefix: string
}

/** 직원 등록 드로어 · 직원 상세가 함께 쓰는 입력 항목 — 값·검증은 react-hook-form, 입력 UI는 antd */
export function MemberFormFields({ form, departments, roles, showDirty = false, idPrefix }: MemberFormFieldsProps) {
  const {
    control,
    formState: { errors, dirtyFields },
  } = form
  const id = (field: MemberFormField) => `${idPrefix}-${field}`
  const label = (field: MemberFormField) =>
    dirtyLabel(MEMBER_FIELD_LABEL[field], showDirty && isFieldDirty(dirtyFields[field]))
  const item = (field: MemberFormField, required = false) => ({
    label: label(field),
    htmlFor: id(field),
    required,
    ...fieldStatus(errors[field]?.message),
  })

  const departmentOptions = [{ value: '', label: UNASSIGNED_LABEL }, ...departmentSelectOptions(departments)]
  const roleOptions = [
    { value: '', label: UNASSIGNED_LABEL },
    ...roles.map((role) => ({ value: String(role.id), label: role.name })),
  ]

  return (
    <Form layout="vertical" component={false}>
      <Form.Item {...item('name', true)}>
        <Controller
          control={control}
          name="name"
          render={({ field }) => <Input id={id('name')} autoComplete="off" {...field} />}
        />
      </Form.Item>
      <Form.Item {...item('email', true)}>
        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <Input id={id('email')} type="email" placeholder="name@teoflow.com" autoComplete="off" {...field} />
          )}
        />
      </Form.Item>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item {...item('employeeNumber', true)}>
            <Controller
              control={control}
              name="employeeNumber"
              render={({ field }) => <Input id={id('employeeNumber')} placeholder="T-0000" autoComplete="off" {...field} />}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item {...item('joinedOn', true)}>
            <Controller
              control={control}
              name="joinedOn"
              render={({ field }) => (
                <DatePicker
                  id={id('joinedOn')}
                  ref={field.ref}
                  style={{ width: '100%' }}
                  value={toDayjs(field.value)}
                  onChange={(date) => field.onChange(fromDayjs(date))}
                  onBlur={field.onBlur}
                />
              )}
            />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item {...item('phoneNumber')}>
        <Controller
          control={control}
          name="phoneNumber"
          render={({ field }) => (
            <Input id={id('phoneNumber')} type="tel" placeholder="010-0000-0000" autoComplete="off" {...field} />
          )}
        />
      </Form.Item>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item {...item('departmentId')}>
            <Controller
              control={control}
              name="departmentId"
              render={({ field }) => (
                <Select
                  id={id('departmentId')}
                  ref={field.ref}
                  options={departmentOptions}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item {...item('roleId')}>
            <Controller
              control={control}
              name="roleId"
              render={({ field }) => (
                <Select
                  id={id('roleId')}
                  ref={field.ref}
                  options={roleOptions}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  )
}
