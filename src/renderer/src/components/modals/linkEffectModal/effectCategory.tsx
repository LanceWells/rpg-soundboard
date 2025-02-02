import { useMemo } from 'react'
import { SoundBoard, SoundCategory, SoundGroupSource } from 'src/apis/audio/types/items'
import GroupLink from './effectLink'

export type GroupCategoryProps = {
  board: SoundBoard
  category: SoundCategory
}

export default function GroupCategory(props: GroupCategoryProps) {
  const { board, category } = props

  const links = useMemo(() => {
    return board.groups
      .filter((g) => g.type === 'source' && g.category === category.id)
      .map((g) => {
        return <GroupLink key={`link-${g.id}`} boardID={board.id} group={g as SoundGroupSource} />
      })
  }, [board.groups, category])

  return (
    <li>
      {`${board.name} - ${category.name}`}
      <ul>{links}</ul>
    </li>
  )
}
