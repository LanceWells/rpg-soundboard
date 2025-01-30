import { useAudioStore } from '@renderer/stores/audioStore'
import { useCallback, useMemo } from 'react'
import { SoundGroupSource } from 'src/apis/audio/types/items'
import { useShallow } from 'zustand/react/shallow'

export type GroupLinkProps = {
  group: SoundGroupSource
}

export default function GroupLink(props: GroupLinkProps) {
  const { group } = props

  const { activeBoard, updateLinks } = useAudioStore(
    useShallow((state) => ({
      activeBoard: state.activeBoard,
      updateLinks: state.updateLinks
    }))
  )

  const isChecked = useMemo(
    () =>
      activeBoard?.groups.find((g) => g.type === 'reference' && g.id === group.id) !== undefined,
    [activeBoard]
  )

  const onChecked = useCallback(() => {}, [])

  return (
    <li className="flex pt-2 gap-2">
      <input checked={isChecked} type="checkbox" className="checkbox" />
      {group.name}
    </li>
  )
}
