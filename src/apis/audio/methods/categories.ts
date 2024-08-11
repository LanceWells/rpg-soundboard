import {
  Categories,
  CreateCategoryRequest,
  CreateCategoryResponse,
  DeleteCategoryRequest,
  DeleteCategoryResponse,
  GetGroupsForCategoryRequest,
  GetGroupsForCategoryResponse,
  GetUncategorizedGroupsRequest,
  GetUncategorizedGroupsResponse,
  ReorderCategoriesRequest,
  ReorderCategoriesResponse,
  UpdateCategoryRequest,
  UpdateCategoryResponse
} from '../interface'

export const CategoriesAudioAPI: Categories = {
  Create: function (request: CreateCategoryRequest): CreateCategoryResponse {
    throw new Error('Function not implemented.')
  },
  Update: function (request: UpdateCategoryRequest): UpdateCategoryResponse {
    throw new Error('Function not implemented.')
  },
  Delete: function (request: DeleteCategoryRequest): DeleteCategoryResponse {
    throw new Error('Function not implemented.')
  },
  Reorder: function (request: ReorderCategoriesRequest): ReorderCategoriesResponse {
    throw new Error('Function not implemented.')
  },
  GetCategorizedGroups: function (
    request: GetGroupsForCategoryRequest
  ): GetGroupsForCategoryResponse {
    throw new Error('Function not implemented.')
  },
  GetUncategorizedGroups: function (
    request: GetUncategorizedGroupsRequest
  ): GetUncategorizedGroupsResponse {
    throw new Error('Function not implemented.')
  }
}
