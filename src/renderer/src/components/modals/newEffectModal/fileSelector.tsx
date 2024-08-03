export type FileSelectorProps = JSX.IntrinsicElements['input'] & {
  className?: string
  formName: string
  error?: string
}

export default function FileSelector(props: FileSelectorProps) {
  const { className, formName, error, ...others } = props

  return (
    <div className="form-control">
      <div className="label">
        <span className="label-text mt-4">{formName}</span>
      </div>
      <input
        type="file"
        className={`
          file-input
          file-input-bordered
          ${error ? 'input-error' : ''}
          ${className}
          `}
        {...others}
      />
      <div className="label">
        <span className="label-text-alt text-error">{error}</span>
      </div>
    </div>
  )
}
