import { Form, Input } from 'antd'
import { Controller, type UseFormReturn } from 'react-hook-form'
import { isFieldDirty } from '../../lib/form'
import { dirtyLabel, fieldStatus } from '../../lib/formItem'
import { PermissionCheckboxes } from './PermissionCheckboxes'
import { ROLE_FIELD_LABEL, type RoleFormField, type RoleFormValues } from './roleForm'

interface RoleFormFieldsProps {
  form: UseFormReturn<RoleFormValues>
  idPrefix: string
  showDirty?: boolean
}

export function RoleFormFields({ form, idPrefix, showDirty = false }: RoleFormFieldsProps) {
  const {
    control,
    formState: { errors, dirtyFields },
  } = form
  const label = (field: RoleFormField) =>
    dirtyLabel(ROLE_FIELD_LABEL[field], showDirty && isFieldDirty(dirtyFields[field]))

  return (
    <Form layout="vertical" component={false}>
      <Form.Item label={label('name')} htmlFor={`${idPrefix}-name`} required {...fieldStatus(errors.name?.message)}>
        <Controller
          control={control}
          name="name"
          render={({ field }) => <Input id={`${idPrefix}-name`} autoComplete="off" placeholder="예: 인사 담당" {...field} />}
        />
      </Form.Item>
      <Form.Item
        label={label('description')}
        htmlFor={`${idPrefix}-description`}
        {...fieldStatus(errors.description?.message)}
      >
        <Controller
          control={control}
          name="description"
          render={({ field }) => <Input.TextArea id={`${idPrefix}-description`} rows={3} {...field} />}
        />
      </Form.Item>
      <Form.Item label={label('permissions')} {...fieldStatus(errors.permissions?.message)}>
        <Controller
          control={control}
          name="permissions"
          render={({ field }) => (
            <PermissionCheckboxes
              idPrefix={`${idPrefix}-perm`}
              value={field.value}
              onChange={field.onChange}
              invalid={Boolean(errors.permissions)}
            />
          )}
        />
      </Form.Item>
    </Form>
  )
}
