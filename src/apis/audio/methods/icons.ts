import {
  BulkGenGroupInputsRequest,
  BulkGenGroupInputsResponse,
  GetIconRequest,
  GetIconResponse,
  IIcons,
  SearchIconsRequest,
  SearchIconsResponse
} from '../types/icons'
import { soundboardIcons } from '../utils/fetchIcons'

export const IconsApi: IIcons = {
  /**
   * @inheritdoc
   */
  GenGroupInput: async function (
    request: BulkGenGroupInputsRequest
  ): Promise<BulkGenGroupInputsResponse> {
    const { filePaths, name } = request
    const bestIcon = await soundboardIcons.GetBestIcon(name)

    return {
      group: {
        icon: {
          foregroundColor: '#ffffff',
          name: bestIcon.name,
          type: 'svg'
        },
        effects: filePaths.map((f) => ({
          name: f,
          path: f,
          volume: 100
        })),
        name: name,
        tags: name.split(/\s/g),
        type: 'source',
        variant: 'Default'
      }
    }
  },
  Search: function (request: SearchIconsRequest): SearchIconsResponse {
    const resp = soundboardIcons.SearchIcons(request.search)
    return {
      icons: resp
    }
  },
  GetIcon: function (request: GetIconRequest): GetIconResponse {
    const resp = soundboardIcons.GetIcon(request.iconName)
    return {
      icon: resp
    }
  }
}
