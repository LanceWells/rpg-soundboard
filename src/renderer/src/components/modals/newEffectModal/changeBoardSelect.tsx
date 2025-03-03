import { useAudioStore } from '@renderer/stores/audioStore'
import { ChangeEventHandler, useCallback, useMemo, useState } from 'react'
import { BoardID } from 'src/apis/audio/types/boards'
import { GroupID } from 'src/apis/audio/types/groups'
import { useShallow } from 'zustand/react/shallow'
import { EditEffectModalId } from './editEffectModal'

export type ChangeBoardSelectProps = {
  groupID: GroupID | undefined
}

export default function ChangeBoardSelect(props: ChangeBoardSelectProps) {
  const { groupID } = props

  const { boards, activeBoard, moveGroup } = useAudioStore(
    useShallow((state) => ({
      boards: state.boards,
      activeBoard: state.activeBoard,
      moveGroup: state.moveGroup
    }))
  )

  const [selectedValue, setSelectedValue] = useState(activeBoard?.id)

  const options = useMemo(
    () =>
      boards.map((b) => (
        <option value={b.id} key={b.id}>
          {b.name}
        </option>
      )),
    [boards, selectedValue]
  )

  const onChange = useCallback<ChangeEventHandler<HTMLSelectElement>>(
    (e) => {
      if (groupID) {
        moveGroup(groupID, e.target.value as BoardID)
        setSelectedValue(activeBoard?.id)
        ;(document.getElementById(EditEffectModalId) as HTMLDialogElement).close()
      }
    },
    [groupID]
  )

  return (
    <select value={selectedValue} onChange={onChange} className="select select-bordered">
      {options}
    </select>
  )
}
