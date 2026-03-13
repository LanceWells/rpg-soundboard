import { GroupIcon } from '@renderer/components/icon/base'
import VirtualizedSearch from '@renderer/components/icon/virtualizedSearch'
import { useAudioStore } from '@renderer/stores/audio/audioStore'
import fuse from 'fuse.js'
import { CSSProperties, JSX } from 'react'
import { useFieldArray } from 'react-hook-form'
import { ISoundGroup, SequenceElementID } from 'src/apis/audio/types/items'
import { useShallow } from 'zustand/shallow'
import { FormInput } from '../types'
import { v4 } from 'uuid'
import { AddIcon } from '@renderer/assets/icons'

export type SequenceListLookupProps = {
  className?: string
}

export function SequenceListLookup(props: SequenceListLookupProps) {
  const { className } = props

  const { append } = useFieldArray<FormInput>({
    name: 'request.sequence'
  })

  const groups = useAudioStore(useShallow((store) => store.groups))
  const onAdd = (group: ISoundGroup) =>
    append({
      type: 'group',
      groupID: group.id,
      id: `seq-${v4()}` as SequenceElementID
    })

  const onSearch = (searchText: string) => {
    const fuseSearch = new fuse(groups, {
      keys: ['name', 'tags', 'variant'],
      threshold: 0.1
    })

    const results = fuseSearch.search(searchText)

    results.reduce((acc, curr) => {
      if (acc.has(curr.item.id)) {
        console.error('duplicate group')
      }

      acc.set(curr.item.id, curr.item)

      return acc
    }, new Map<string, ISoundGroup>())

    const soughtGroups = results.map((r) => r.item).filter((s) => s.type === 'source')

    return soughtGroups.map<SequenceListItemProps>((group) => {
      return {
        group,
        onAdd
      } as SequenceListItemProps & JSX.IntrinsicAttributes
    })
  }

  return (
    <VirtualizedSearch
      estimateSize={() => 114}
      className={className}
      onSearch={onSearch}
      RenderItem={SequenceListItem}
    />
  )
}

type SequenceListItemProps = {
  group: ISoundGroup
  style: CSSProperties
  onAdd: (groupID: ISoundGroup) => void
}

function SequenceListItem(props: SequenceListItemProps) {
  const { group, onAdd, style } = props

  return (
    <div style={style} className="flex w-full h-[144px] items-center justify-between">
      <GroupIcon icon={group.icon} />
      <span>{group.name}</span>
      <div className="btn btn-circle btn-secondary" role="button" onClick={() => onAdd(group)}>
        <AddIcon />
      </div>
    </div>
  )
}
