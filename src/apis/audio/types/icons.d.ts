import { IconBody } from '../utils/fetchIcons'

/**
 * Request for {@link IIcons.GenGroupInput}.
 */
export type GenGroupInputRequest = {
  /**
   * The set of filepaths that will be used when generating the new group.
   */
  filePaths: string[]

  /**
   * The text that will be used for the icon's name once it is created. This is used to fetch
   * related words from the icons repository.
   */
  name: string
}

/**
 * Response for {@link IIcons.GenGroupInput}.
 */
export type GenGroupInputResponse = {
  /**
   * Suggested input for the group, based on the associated request.
   */
  group: SoundGroupSourceEditableFields
}

/**
 * Request for {@link IIcons.SearchIcons}.
 */
export type SearchIconsRequest = {
  search: string
}

/**
 * Response for {@link IIcons.SearchIcons}.
 */
export type SearchIconsResponse = {
  icons: IconBody[]
}

/**
 * Request for {@link IIcons.GetIcon}.
 */
export type GetIconRequest = {
  iconName: string
}

/**
 * Response for {@link IIcons.GetIcon}.
 */
export type GetIconResponse = {
  icon: IconBody | undefined
}

export interface IIcons {
  /**
   * Generates an input representative of the request. Guesses the best icon for a set of group
   * inputs. Particularly useful when generating groups in bulk.
   * @param request See {@link GenGroupInputRequest}.
   */
  GenGroupInput(request: GenGroupInputRequest): Promise<GenGroupInputResponse>

  /**
   * Searches the game icons repository based on the provided input.
   * @param request See {@link SearchIconsRequest}.
   */
  Search(request: SearchIconsRequest): SearchIconsResponse

  /**
   * Gets the body for a particular icon, based on the icon's identifier.
   * @param request See {@link GetIconRequest}.
   */
  GetIcon(request: GetIconRequest): GetIconResponse
}
