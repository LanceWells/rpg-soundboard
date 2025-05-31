import { useAudioStore } from '@renderer/stores/audio/audioStore'
import { useShallow } from 'zustand/shallow'
import { SelectorElement } from './groupSelectorElement'

export default function SequenceGroupSelector() {
  const { boards } = useAudioStore(
    useShallow((state) => ({
      boards: state.boards,
      activeBoardID: state.activeBoardID,
      editingBoard: state.editingBoard
    }))
  )

  const groups = boards
    .flatMap((b) => b.groups)
    .filter((g) => g.type === 'source')
    .map((g) => <SelectorElement g={g} key={g.id} />)

  return (
    <div
      className={`
      rounded-md
      flex
      gap-2
      p-2
      bg-base-300
      h-full
      overflow-y-scroll
      overflow-x-hidden
      flex-col
    `}
    >
      {groups}
    </div>
  )
}
