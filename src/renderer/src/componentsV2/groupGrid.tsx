import { GroupBase } from './group'
import MusicNote from '@renderer/assets/images/MusicScroll.png'
import BirdBag from '@renderer/assets/images/BirdBag.png'
import TownHero from '@renderer/assets/images/TownHero.png'

export function GroupGrid() {
  return (
    <div
      className={`
      w-full
      h-full
      grid
      grid-cols-[288px_1fr]
    `}
    >
      <div
        className={`
        bg-paper-2
        p-2
      `}
      >
        <h1
          className={`
          text-2xl
          w-full
          text-center
        `}
        >
          RPG Soundboard
        </h1>
        <img src={TownHero} />
      </div>
      <div
        className={`
          grid
          max-h-dvh
          overflow-hidden
          grid-rows-[min-content_1fr]
      `}
      >
        <div
          className={`
          w-fit
          shadow-pixel-md
          grid
          grid-rows-2
          bg-shop-200
          shop-border
          p-2
        `}
        >
          <span>Whatchu want?</span>
          <input
            type="text"
            className={`
            bg-black
            p-1
            border-4
            border-shop-100
          `}
          />
        </div>
        <div
          className={`
          w-full
          bg-shop-200
          shop-border
          flex
          min-h-full
          box-border
        `}
        >
          <div
            className={`
              overflow-y-scroll
              overflow-x-hidden
              flex
              content-start
              justify-center
              flex-wrap
              gap-2
              p-2
              shop-wall
              grow
            `}
          >
            <GroupBase src={MusicNote} />
            <GroupBase src={MusicNote} />
            <GroupBase src={MusicNote} />
            <GroupBase src={MusicNote} />
            <GroupBase src={BirdBag} />
            <GroupBase src={BirdBag} />
            <GroupBase src={BirdBag} />
            <GroupBase src={BirdBag} />
            <GroupBase src={BirdBag} />
          </div>
        </div>
      </div>
    </div>
  )
}
