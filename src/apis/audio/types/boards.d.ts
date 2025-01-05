import type { SoundBoardEditableFields, SoundBoard } from './items'

/**
 * The request object for {@link IBoards.Get}.
 */
export type GetRequest = {
  /**
   * The ID for the board to fetch.
   */
  boardID: BoardID
}

/**
 * The response object for {@link IBoards.Get}.
 */
export type GetResponse = {
  /**
   * The board that has been fetched, or undefined if the board was not found.
   */
  board: SoundBoard | undefined
}

/**
 * The request object for {@link IBoards.GetAll}.
 */
export type GetAllRequest = {}

/**
 * The response object for {@link IAudioApi.GetAllBoards}.
 */
export type GetAllResponse = {
  /**
   * All of the soundboards that are currently stored.
   */
  boards: SoundBoard[]
}

/**
 * The request object for {@link IBoards.Update}.
 */
export type UpdateRequest = {
  /**
   * The ID for the board that should be updated.
   */
  boardID: BoardID

  /**
   * The new fields that should be configured for the given board.
   */
  fields: SoundBoardEditableFields
}

/**
 * The response object for {@link IBoards.Update}.
 */
export type UpdateResponse = { board: SoundBoard }

/**
 * The request object for {@link IBoards.Delete}.
 */
export type DeleteRequest = {
  /**
   * The ID for the board to be deleted.
   */
  boardID: BoardID
}

/**
 * The response object for {@link IBoards.Delete}.
 */
export type DeleteResponse = {}

/**
 * The request object for {@link IBoards.Create}.
 */
export type CreateRequest = Omit<SoundBoardEditableFields, 'categories'>

/**
 * The response object for {@link IBoards.Create}.
 */
export type CreateResponse = {
  /**
   * The board that has been created.
   */
  board: SoundBoard
}

/**
 * An ID that refers to a particular soundboard.
 */
export type BoardID = `brd-${string}-${string}-${string}-${string}-${string}`

/**
 * A fragment of the larger {@link IAudioApi} interface.
 *
 * Specifically for use with "SoundBoards". Soundboards refer to the largest containers for sounds,
 * and are a means to group large numbers of sounds together.
 */
export interface IBoards {
  /**
   * Gets a board using the given request object.
   * @param request See {@link GetRequest}.
   */
  Get(request: GetRequest): GetResponse

  /**
   * Creates a new board using the provided set of parameters.
   * @param request See {@link CreateRequest}.
   */
  Create(request: CreateRequest): CreateResponse

  /**
   * Updates a board using the provided object.
   * @param request See {@link UpdateRequest}
   */
  Update(request: UpdateRequest): UpdateResponse

  /**
   * Deletes a board that matches the provided request object.
   * @param request See {@link DeleteRequest}.
   */
  Delete(request: DeleteRequest): DeleteResponse

  /**
   * Gets all boards stored locally.
   * @param request See {@link GetAllRequest}.
   */
  GetAll(request: GetAllRequest): GetAllResponse
}
