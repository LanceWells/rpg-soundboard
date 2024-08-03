export type TextFieldProps = JSX.IntrinsicElements['input'] & {
  className?: string
  formName: string
  error?: string
}

export default function TextField(props: TextFieldProps) {
  const { className, formName, error, ...others } = props

  return (
    <div className="form-control">
      <div className="label">
        <span className="label-text mt-4">{formName}</span>
      </div>
      <input
        type="text"
        className={`
          input
          input-bordered
          w-full
          max-w-xs
          ${error ? 'input-error' : ''}
          ${className}
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
