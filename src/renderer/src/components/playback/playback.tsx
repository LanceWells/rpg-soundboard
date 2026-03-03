import { useAudioStore } from '@renderer/stores/audio/audioStore'
import { GroupIcon } from '../icon/base'
import { MoveIcon, StopIcon } from '@renderer/assets/icons'

export type PlaybackProps = {}

export function Playback(props: PlaybackProps) {
  const {} = props

  const soundtrack = useAudioStore((state) => state.activeSoundtrack)
  const playNextSong = useAudioStore((state) => state.playNextSong)
  const stopGroup = useAudioStore((state) => state.stopGroup)
  const setMusicVolume = useAudioStore((state) => state.setMusicVolume)

  if (soundtrack === null) {
    return null
  }

  return (
    <div
      className={`
      bg-shop-300
      shadow-pixel-md
      my-4
      p-2
      grid
      [grid-template-areas:"title_title"_"album_controls"]
    `}
    >
      <span className="[grid-area:title]">
        {soundtrack.groupName} - {soundtrack.effectName}
      </span>
      <div className={`[grid-area:album]`}>
        <GroupIcon icon={soundtrack.icon} />
      </div>
      <div
        className={`
          grid
          gap-1
          content-center
          [grid-area:controls]
          [grid-template-areas:"stop_next"_"volume_volume"]
      `}
      >
        <button onClick={() => stopGroup(soundtrack.groupID)} className="btn [grid-area:stop]">
          <StopIcon />
        </button>
        <button onClick={() => playNextSong()} className="btn [grid-area:next">
          <MoveIcon />
        </button>
        <input
          type="range"
          className="range [grid-area:volume]"
          min={0}
          max={200}
          step={10}
          value={soundtrack.volume ?? 100}
          onChange={(e) => {
            const newVolume = Number.parseInt(e.currentTarget.value)
            setMusicVolume(newVolume)
            console.log(newVolume)
          }}
        />
      </div>
    </div>
  )
}
