import { SoundGroup } from 'src/apis/audio/interface'
import { IconEffect } from '../effect/icon-effect'
import { useCallback, useMemo } from 'react'
import { useAudioStore } from '@renderer/stores/audioStore'

export type GroupProps = {
  group: SoundGroup
}

export default function Group(props: GroupProps) {
  const { group } = props

  const { playGroup, playingGroups } = useAudioStore()

  const onClickPlay = useCallback(() => {
    playGroup(group.id)
  }, [group])

  const isPlaying = useMemo(() => {
    return playingGroups.includes(group.id)
  }, [playingGroups, group.id])

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
        z-0
      `}
    >
      <div
        className={`
        relative
          z-0
          ${
            isPlaying
              ? `
            before:-top-1
            before:-right-1
            before:-left-1
            before:-bottom-1
            `
              : `
            before:-top-0
            before:-right-0
            before:-left-0
            before:-bottom-0
            `
          }
          before:[transition-property:_all]
          before:[transition-timing-function:_cubic-bezier(0.4,_0,_0.2,_1)]
          before:[transition-duration:_150ms]
          before:-z-10
          before:absolute
          
          before:rounded-lg
          before:animate-radialspin
          before:bg-[radial-gradient(circle_at_center,red,_rebeccapurple)]
          `}
      >
        <IconEffect icon={group.icon} />
      </div>
      <span className="text-sm flex justify-center">{group.name}</span>
    </div>
  )
}
