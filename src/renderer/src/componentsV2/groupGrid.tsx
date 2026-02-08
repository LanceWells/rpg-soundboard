import { GroupBase } from './group'

export function GroupGrid() {
  return (
    <div
      className={`
      w-full
      h-full
      grid
      grid-cols-[280px_1fr]
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
      </div>
      <div
        className={`
          mx-4
          my-8
          grid
          gap-4
          grid-rows-[min-content_1fr]
          
      `}
      >
        <div
          className={`
          p-3
          w-fit
          border-4
          shadow-pixel-md
          grid
          grid-rows-2
          bg-shop-200
          border-shop-100
          shadow-shop-300
        `}
        >
          <span>What are you looking for?</span>
          <input
            type="text"
            className={`
            bg-black
            rounded-md
            p-1
            border-4
            border-shop-100
          `}
          />
        </div>
        <div
          className={`
          w-full
          h-full
          border-4
          shadow-pixel-md
          bg-shop-200
          border-shop-100
          shadow-shop-300
        `}
        >
          <div
            className={`
            flex
            justify-center
            flex-wrap
            gap-4
            m-2
            overflow-y-scroll
          `}
          >
            <GroupBase />
            <GroupBase />
            <GroupBase />
            <GroupBase />
            <GroupBase />
            <GroupBase />
            <GroupBase />
            <GroupBase />
            <GroupBase />
            <GroupBase />
            <GroupBase />
          </div>
        </div>
      </div>
    </div>
  )
}
