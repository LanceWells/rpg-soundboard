import TownHero from '@renderer/assets/images/Layout/TownHero.png'
import { Link } from '@tanstack/react-router'
import { Route as CreateSoundRoute } from '@renderer/routes/sound/create'
import { Route as BoardRoute } from '@renderer/routes/'
import { Route as BulkUploadRoute } from '@renderer/routes/sound/bulkUpload'
import { Playback } from '../playback/playback'
import { SearchBox } from '../search/search'
import { SearchPins } from '../search/pins'

/**
 * Sidebar navigation panel containing the app header, hero image, route links, playback widget, pinned searches, and search box.
 */
export function Nav() {
  return (
    <div
      className={`
      bg-paper-2
      p-2
      shop-wall
      grid
      h-dvh
      [grid-template-areas:"header"_"hero"_"navbuttons"_"playback"_"pins"_"search"]
      grid-rows-[min-content_min-content_1fr_min-content_min-content_min-content]
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
        <li>
          <Link to={BulkUploadRoute.fullPath}>Bulk Upload</Link>
        </li>
      </ul>
      <Playback />
      <SearchPins />
      <SearchBox />
    </div>
  )
}
