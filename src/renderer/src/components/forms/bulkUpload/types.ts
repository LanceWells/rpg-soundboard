import { CreateRequest } from 'src/apis/audio/types/groups'

export type BulkButtonLoading = {
  state: 'loading'
  filePaths: string[]
  name: string
}

export type BulkButtonLoaded = {
  state: 'loaded'
  name: string
  button: CreateRequest
}

export type BulkButton = BulkButtonLoading | BulkButtonLoaded

export type BulkButtonStates = Record<string, BulkButton>

export type FormInput = {
  bulkSounds: BulkButton[]
  tags: string[]
}
