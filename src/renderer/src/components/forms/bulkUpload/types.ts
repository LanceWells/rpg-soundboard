import { SoundGroupSourceEditableFields } from 'src/apis/audio/types/items'

export type BulkButtonLoading = {
  state: 'loading'
  filePaths: string[]
  name: string
}

export type BulkButtonLoaded = {
  state: 'loaded'
  name: string
  button: SoundGroupSourceEditableFields
}

export type BulkButton = BulkButtonLoading | BulkButtonLoaded

export type BulkButtonStates = Record<string, BulkButton>
