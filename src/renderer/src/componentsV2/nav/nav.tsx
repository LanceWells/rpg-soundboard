import TownHero from '@renderer/assets/images/TownHero.png'
import { useAudioStore } from '@renderer/stores/audio/audioStore'
import { Link } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { useDebounce } from 'use-debounce'
import { Route as CreateSoundRoute } from '@renderer/routes/sound/create'
import { Route as BoardRoute } from '@renderer/routes/'

export type NavProps = {}

export function Nav(props: NavProps) {
  const {} = props

  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebounce(search, 500)

  const searchForGroups = useAudioStore((store) => store.searchForGroups)

  useEffect(() => {
    searchForGroups(debouncedSearch, ['source', 'sequence'])
  }, [debouncedSearch])

  return (
    <div
      className={`
      bg-paper-2
      p-2
      shop-wall
      grid
      h-dvh
      [grid-template-areas:"header"_"hero"_"navbuttons"_"search"]
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
      <ul className="list-disc">
        <li>
          <Link to={BoardRoute.fullPath}>Board</Link>
        </li>
        <li>
          <Link to={CreateSoundRoute.fullPath}>New Sound</Link>
        </li>
      </ul>
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
          onChange={(e) => {
            setSearch(e.target.value)
          }}
          placeholder="Search"
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
  )
}
