import type { BoardID } from './boards'
import type {
  SoundCategoryEditableFields,
  SoundCategory,
  SoundGroupSource,
  SoundCategory
} from './items'

export type GetRequest = {
  categoryID: CategoryID
}

export type GetResponse = {
  category: SoundCategory | null
}

/**
 * The request object for {@link ICategories.Create}.
 */
export type CreateRequest = {
  /**
   * The board ID to fetch categories for.
   */
  boardID: BoardID
} & SoundCategoryEditableFields

/**
 * The response object for {@link ICategories.Create}.
 */
export type CreateResponse = {
  /**
   * The category that should be created.
   */
  category: SoundCategory
}

/**
 * The request object for {@link ICategories.Delete}.
 */
export type DeleteRequest = {
  boardID: BoardID
  categoryID: CategoryID
}

/**
 * The response object for {@link ICategories.Delete}.
 */
export type DeleteResponse = {}

/**
 * The request object for {@link ICategories.Update}.
 */
export type UpdateRequest = {
  boardID: BoardID
  categoryID: CategoryID
} & SoundCategoryEditableFields

/**
 * The response object for {@link ICategories.Update}.
 */
export type UpdateResponse = {
  category: SoundCategory
}

/**
 * The request object for {@link ICategories.GetCategorizedGroups}.
 */
export type GetCategorizedGroupsRequest = {
  categoryID: CategoryID
}

/**
 * The response object for {@link ICategories.GetCategorizedGroups}.
 */
export type GetCategorizedGroupsResponse = {
  groups: SoundGroup[]
}

/**
 * The request object for {@link ICategories.GetUncategorizedGroups}.
 */
export type GetUncategorizedGroupsRequest = {
  boardID: BoardID
}

/**
 * The response object for {@link ICategories.GetUncategorizedGroups}.
 */
export type GetUncategorizedGroupsResponse = {
  groups: SoundGroup[]
}

/**
 * The request object for {@link ICategories.Reorder}.
 */
export type ReorderRequest = {
  boardID: BoardID
  newOrder: CategoryID[]
}

/**
 * The response object for {@link ICategories.Reorder}.
 */
export type ReorderResponse = {}

/**
 * An ID that refers to a particular sound category.
 */
export type CategoryID = `cat-${string}-${string}-${string}-${string}-${string}`

/**
 * A fragment of the larger Audio interface.
 *
 * Specifically for use with "Categories". Categories refer to visual groupings of buttons. The idea
 * is that not every SoundGroup will need a category, but categories are available to represent a
 * visual hierarchy for those groups that should be contained together.
 */
export interface ICategories {
  Get(request: GetRequest): GetResponse

  /**
   * Creates a new category using the set list of parameters.
   * @param request See {@link CreateRequest}.
   */
  Create(request: CreateRequest): CreateResponse

  /**
   * Updates an existing category using the set list of parameters.
   * @param request See {@link UpdateRequest}.
   */
  Update(request: UpdateRequest): UpdateResponse

  /**
   * Deletes an existing category that matches the set parameters.
   * @param request See {@link DeleteRequest}.
   */
  Delete(request: DeleteRequest): DeleteResponse

  /**
   * Reorders categories within a board using the set list of parameters.
   * @param request See {@link ReorderRequest}.
   */
  Reorder(request: ReorderRequest): ReorderResponse

  /**
   * Gets a set of groups that exist within a set category.
   * @param request See {@link GetCategorizedGroupsRequest}.
   */
  GetCategorizedGroups(request: GetCategorizedGroupsRequest): GetCategorizedGroupsResponse

  /**
   * Gets all groups that do not have a set category.
   * @param request See {@link GetUncategorizedGroupsRequest}.
   */
  GetUncategorizedGroups(request: GetUncategorizedGroupsRequest): GetUncategorizedGroupsResponse
}
