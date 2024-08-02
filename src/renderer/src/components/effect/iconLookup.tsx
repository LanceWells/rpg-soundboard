import { soundboardIcons } from '@renderer/utils/fetchIcons'
import { useMemo } from 'react'
import { IconPreview } from './iconPreview'

export default function IconLookup() {
  const search = 'moon'

  const icons = useMemo(() => {
    return soundboardIcons.SearchIcons(search)
  }, [search])

  const iconNodes = useMemo(() => {
    return icons.map((i) => <IconPreview icon={i.body} key={i.name} />)
  }, [icons])

  return <div className="bg-base-300">{iconNodes}</div>
}
