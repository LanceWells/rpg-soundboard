import { useAudioStore } from '@renderer/stores/audio/audioStore'
import { useEffect, useMemo, useState } from 'react'
import { CreateSequenceRequest, GroupID } from 'src/apis/audio/types/groups'
import { useShallow } from 'zustand/react/shallow'
import TextField from '@renderer/components/generic/textField'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core'
import { produce } from 'immer'
import { SequenceElementID, SoundGroupSequenceElement } from 'src/apis/audio/types/items'
import { snapCenterToCursor } from '@dnd-kit/modifiers'
import SequenceGroupSelector, { SelectorElement } from './groupSelector'
import { IdIsGroup } from '@renderer/utils/id'
import SequenceEditingZone, { dropZoneScrollContainerID, EditingDropZoneID } from './editingZone'
import { v4 as uuidv4 } from 'uuid'
import { usePrevious } from '@dnd-kit/utilities'

export type SequenceModalProps = {
  id: string
  handleSubmit: (req: CreateSequenceRequest) => void
  handleClose?: () => void
  actionName: string
  modalTitle: string
}

export default function SequenceModal(props: SequenceModalProps) {
  const { actionName, handleSubmit, id, modalTitle, handleClose } = props

  const { editingSequence, updateSequenceName, updateSequenceOrder, boards } = useAudioStore(
    useShallow((state) => ({
      editingSequence: state.editingSequence,
      updateSequenceName: state.updateSequenceName,
      updateSequenceOrder: state.updateSequenceElements,
      boards: state.boards
    }))
  )

  const groupSet = useMemo(
    () =>
      new Map(
        boards
          .flatMap((b) => b.groups)
          .filter((g) => g.type === 'source')
          .map((g) => [g.id, g])
      ),
    [boards]
  )

  const newBlankElement = () =>
    updateSequenceOrder([
      { type: 'delay', id: `seq-${crypto.randomUUID()}`, msToDelay: 0 },
      ...(editingSequence?.sequence ?? [])
    ])

  const [effectNameErr, setEffectNameErr] = useState('')

  const seq = editingSequence?.sequence ?? []
  const [draggingID, setDraggingID] = useState<GroupID | null>(null)
  const prevItemCount = usePrevious(editingSequence?.sequence.length)

  useEffect(() => {
    const itemCount = editingSequence?.sequence.length
    if (itemCount === (prevItemCount ?? 0) + 1) {
      const scrollContainer = document.getElementById(dropZoneScrollContainerID)
      const lastElement = scrollContainer?.children[scrollContainer.children.length - 1]
      lastElement?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [editingSequence, prevItemCount])

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    console.debug(active)
    console.debug(over)

    if (over?.id !== EditingDropZoneID) {
      return
    }

    const activeID = active.id

    if (!IdIsGroup(activeID)) {
      return
    }

    const activeObj = groupSet.get(activeID)
    if (activeObj === undefined) {
      return
    }

    const newSeq = produce(seq, (draft) => {
      draft.push({
        type: 'group',
        groupID: activeID,
        id: `seq-${uuidv4()}` as SequenceElementID
      })
    })

    updateSequenceOrder(newSeq as [SoundGroupSequenceElement, ...[SoundGroupSequenceElement]])

    return
  }

  const onDragFromSelect = (event: DragStartEvent) => {
    const activeID = event.active.id

    if (IdIsGroup(activeID)) {
      setDraggingID(activeID)
    }
  }

  return (
    <dialog id={id} className="modal">
      <div className="modal-box min-w-fit overflow-visible relative">
        <h3 className="font-bold text-lg">{modalTitle}</h3>
        <div className='[grid-template-areas:""]'>
          <TextField
            required
            className="[grid-area:name]"
            fieldName="Name"
            value={editingSequence?.name}
            error={effectNameErr}
            placeholder="My Sequence"
            onChange={(e) => updateSequenceName(e.target.value)}
          />
          <div
            id="drag-test"
            className={`
              grid
              py-2
              [grid-template-areas:"sequence_picker"_"sequence_picker"_"controls_controls"]
              grid-cols-[2fr_1fr]
              grid-rows-[1fr_min-content]
              w-[640px]
              h-[360px]
              max-h-[360px]
              gap-2
            `}
          >
            <DndContext
              modifiers={[snapCenterToCursor]}
              onDragStart={onDragFromSelect}
              onDragEnd={onDragEnd}
            >
              <SequenceEditingZone />
              <SequenceGroupSelector />
              <DragOverlay adjustScale={false}>{getOverlaidItem(draggingID)}</DragOverlay>
            </DndContext>
            <div>
              <button className="[grid-area:newbutton] btn btn-secondary" onClick={newBlankElement}>
                New Element
              </button>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  )
}

function getOverlaidItem(id: GroupID | null) {
  const { getGroup } = useAudioStore(
    useShallow((state) => ({
      getGroup: state.getGroup
    }))
  )

  if (id === null) {
    return null
  }

  return <SelectorElement g={getGroup(id)} />
}
