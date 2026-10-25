import React, { forwardRef, useId } from 'react'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: SelectOption[]
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    label,
    options,
    id: customId,
    className = '',
    ...props
  },
  ref
) {
  const generatedId = useId()
  const id = customId || `select-${generatedId}`

  const selectElement = (
    <select ref={ref} id={id} className={`select ${className}`.trim()} {...props}>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} disabled={opt.disabled}>
          {opt.label}
        </option>
      ))}
    </select>
  )

  if (!label) {
    return selectElement
  }

  return (
    <div className="field-group">
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      {selectElement}
    </div>
  )
})
