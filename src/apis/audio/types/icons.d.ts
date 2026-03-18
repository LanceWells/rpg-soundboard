import { IconBody } from '../utils/fetchIcons'

export type BulkGenGroupInputsRequest = {
  filePaths: string[]
  name: string
}

export type BulkGenGroupInputsResponse = {
  group: SoundGroupSourceEditableFields
}

export type SearchIconsRequest = {
  search: string
}

export type SearchIconsResponse = {
  icons: IconBody[]
}

export type GetIconRequest = {
  iconName: string
}

export type GetIconResponse = {
  icon: IconBody | undefined
}

export interface IIcons {
  GenGroupInput(request: BulkGenGroupInputsRequest): Promise<BulkGenGroupInputsResponse>
  Search(request: SearchIconsRequest): SearchIconsResponse
  GetIcon(request: GetIconRequest): GetIconResponse
}
