export type CheckboxFieldProps = JSX.IntrinsicElements['input'] & {
  className?: string
  formName: string
  error?: string
}

export default function CheckboxField(props: CheckboxFieldProps) {
  const { className, formName, error, ...others } = props

  return (
    <div className={`form-control flex flex-row align-middle gap-2 ${className}`}>
      <span>{formName}</span>
      <input
        type="checkbox"
        className={`
          checkbox
          ${error ? 'input-error' : ''}
        `}
        placeholder="My New Sound"
        {...others}
      />
      <div className="label">
        <span className="label-text-alt text-error">{error}</span>
      </div>
    </div>
  )
}
