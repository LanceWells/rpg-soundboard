/**
 * Props for {@link TextField}.
 */
export type TextFieldProps = JSX.IntrinsicElements['input'] & {
  /**
   * The class name that should be rendered at the root of the element. Will go after necessary
   * classes.
   */
  className?: string

  /**
   * The name of the field that is represented by this text input. This will be rendered as a small
   * label above the text field.
   */
  fieldName: string

  /**
   * An error, if one should be rendered for this particular text field.
   */
  error?: string
}

/**
 * A general-purpose text field for use in a form.
 * @param props See {@link TextFieldProps}.
 */
export default function TextField(props: TextFieldProps) {
  const { className, fieldName: formName, error, ...others } = props

  return (
    <div className={`form-control ${className}`}>
      <div className="label">
        <span className="label-text">{formName}</span>
      </div>
      <input
        type="text"
        className={`
          input
          input-bordered
          w-full
          max-w-xs
          ${error ? 'input-error' : ''}
        `}
        {...others}
      />
      <div className="label">
        <span className="label-text-alt text-error">{error}</span>
      </div>
    </div>
  )
}
