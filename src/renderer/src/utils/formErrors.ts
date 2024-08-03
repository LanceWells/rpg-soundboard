import { FieldError } from 'react-hook-form'

export function GetErrMessage(err: FieldError | undefined): string | undefined {
  if (!err) {
    return undefined
  }

  switch (err.type) {
    case 'required': {
      return 'This field is required'
    }
    default: {
      return err.message
    }
  }
}
