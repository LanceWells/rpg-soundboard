import { SoundGroup } from 'src/apis/audio/interface'
import { IconEffect } from '../effect/icon-effect'
import { useCallback } from 'react'
import { useAudioStore } from '@renderer/stores/audioStore'

export type GroupProps = {
  group: SoundGroup
}

export default function Group(props: GroupProps) {
  const { playGroup } = useAudioStore()

  const { group } = props

  const onClickPlay = useCallback(() => {
    playGroup(group.id)
  }, [group])

  return (
    <div
      onClick={onClickPlay}
      role="button"
      className={`
        cursor-pointer
        hover:brightness-125
        hover:drop-shadow-lg
        shadow-purple-200
        hover
        transition-all
      `}
    >
      <IconEffect icon={group.icon} />
      <span className="text-sm flex justify-center">{group.name}</span>
    </div>
  )
}
