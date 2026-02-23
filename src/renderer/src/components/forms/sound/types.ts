import { CreateRequest, CreateSequenceRequest } from 'src/apis/audio/types/groups'

export const ColorOptions = {
  white: '#bdc3c7',
  cyan: '#16a085',
  green: '#27ae60',
  blue: '#2980b9',
  purple: '#8e44ad',
  black: '#2c3e50',
  yellow: '#f39c12',
  orange: '#d35400',
  red: '#c0392b',
  gray: '#7f8c8d'
}

export type ColorOptions = keyof typeof ColorOptions
export const ColorOptionsHexes = Object.values(ColorOptions)

export type FormInput = GroupFormInput | SequenceFormInput
export type GroupFormInput = { type: 'group'; request: CreateRequest }
export type SequenceFormInput = { type: 'sequence'; request: CreateSequenceRequest }
