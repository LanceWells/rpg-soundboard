import { BoardID } from 'src/apis/audio/types/boards'
import { ISoundGroup, SoundBoard } from 'src/apis/audio/types/items'
import { IAudioApi } from 'src/apis/audio/interface'
import { StateCreator } from 'zustand'
import fuse from 'fuse.js'

/**
 * The state for the soundboard application. Does not contain methods.
 */
export interface BoardSlice {
  /**
   * The set of boards that should be represented by the view.
   */
  boards: SoundBoard[]

  activeBoardID: BoardID | null

  addBoard: IAudioApi['Boards']['Create']
  reorderGroups: IAudioApi['Groups']['Reorder']
  updateBoard: IAudioApi['Boards']['Update']
  deleteBoard: (id: BoardID) => void
  setActiveBoardID: (id: BoardID) => void
  searchForGroups: (searchText: string, types: string[]) => ISoundGroup[]
}

export const createBoardSlice: StateCreator<BoardSlice> = (set) => ({
  activeBoardID: window.audio.Boards.GetAll({}).boards[0]?.id ?? null,
  boards: window.audio.Boards.GetAll({}).boards,
  addBoard(req) {
    const newBoard = window.audio.Boards.Create(req)
    const newBoards = window.audio.Boards.GetAll({}).boards

    set({
      boards: newBoards
    })

    return newBoard
  },
  deleteBoard(id) {
    window.audio.Boards.Delete({
      boardID: id
    })

    const newBoards = window.audio.Boards.GetAll({}).boards
    set({
      boards: newBoards
    })
  },
  reorderGroups(request) {
    window.audio.Groups.Reorder(request)
    const newBoards = window.audio.Boards.GetAll({}).boards

    set({
      boards: newBoards
    })

    return {}
  },
  setActiveBoardID(id) {
    set({
      activeBoardID: window.audio.Boards.Get({ boardID: id }).board?.id ?? null
    })
  },
  updateBoard(request) {
    const updatedBoard = window.audio.Boards.Update(request)
    const newBoards = window.audio.Boards.GetAll({}).boards

    set({
      boards: newBoards
    })

    return updatedBoard
  },
  searchForGroups(searchText, types: string[]) {
    const boards = window.audio.Boards.GetAll({})
    const allGroups = boards.boards.flatMap((b) => b.groups).filter((g) => types.includes(g.type))

    const fuseSearch = new fuse(allGroups, {
      keys: ['name']
    })

    const results = fuseSearch.search(searchText)

    return results.map((r) => r.item)
  }
})
