import { GroupBase } from './group'
import MusicNote from '@renderer/assets/images/MusicScroll.png'
import BirdBag from '@renderer/assets/images/BirdBag.png'
import TownHero from '@renderer/assets/images/TownHero.png'
import GoblinHead from '@renderer/assets/images/Heads/Goblin.png'
import BanditHead from '@renderer/assets/images/Heads/Bandit.png'
import SuccubusHead from '@renderer/assets/images/Heads/Succubus.png'

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
        shop-wall
        grid
        [grid-template-areas:"header"_"hero"_"."_"search"]
        grid-rows-[min-content_min-content_1fr_min-content]
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
        <div
          className={`
          w-full
          shadow-pixel-md
          grid
          grid-rows-2
          bg-shop-200
          p-2
          [grid-area:search]
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
      </div>
      <div
        className={`
          max-h-dvh
          overflow-hidden
      `}
      >
        <div
          className={`
          w-full
          bg-shop-200
          shop-border
          flex
          min-h-full
          max-h-full
          box-border
        `}
        >
          <div
            className={`
              w-full
              overflow-y-scroll
              overflow-x-hidden
              flex
              content-start
              justify-center
              flex-wrap
              attach
              shop-shelf
              bg-local
            `}
          >
            <GroupBase src={MusicNote} variant="Default" title="Music" />
            <GroupBase src={BanditHead} variant="Looping" title="Bandit" />
            <GroupBase src={MusicNote} variant="Rapid" title="Other Music" />
            <GroupBase src={MusicNote} variant="Sequence" title="Even more music" />
            <GroupBase src={BirdBag} variant="Soundtrack" title="A bird bag" />
            <GroupBase src={GoblinHead} variant="Default" title="Goblin" />
            <GroupBase src={BirdBag} variant="Default" title="Another bird bag?" />
            <GroupBase src={BirdBag} variant="Default" title="A third bag of bird" />
          </div>
        </div>
      </div>
    </div>
  )
}
