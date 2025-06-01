import { useAudioStore } from '@renderer/stores/audio/audioStore'
import { MouseEventHandler, useEffect, useMemo, useRef, useState } from 'react'
import { CreateSequenceRequest, GroupID } from 'src/apis/audio/types/groups'
import { useShallow } from 'zustand/react/shallow'
import TextField from '@renderer/components/generic/textField'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core'
import { produce } from 'immer'
import { SequenceElementID, SoundGroupSequenceElement } from 'src/apis/audio/types/items'
import { snapCenterToCursor } from '@dnd-kit/modifiers'
import { IdIsGroup } from '@renderer/utils/id'
import SequenceEditingZone, { dropZoneScrollContainerID, EditingDropZoneID } from './editingZone'
import { v4 as uuidv4 } from 'uuid'
import { usePrevious } from '@dnd-kit/utilities'
import SoundIcon from '@renderer/assets/icons/sound'
import {
  EffectGroup,
  SequenceSoundContainer
} from '@renderer/utils/soundContainer/variants/sequence'
import StopIcon from '@renderer/assets/icons/stop'
import IconLookup from '@renderer/components/effect/iconLookup'
import { IconEffect } from '@renderer/components/effect/icon-effect'
import ForegroundPicker from '@renderer/components/icon/foregroundPicker'
import BackgroundPicker from '@renderer/components/icon/backgroundPicker'
import GroupLookup from '@renderer/components/group/groupLookup'
import { SelectorElement } from './groupSelectorElement'

export type SequenceModalProps = {
  id: string
  handleSubmit: (req: CreateSequenceRequest) => void
  handleClose?: () => void
  actionName: string
  modalTitle: string
}

export default function SequenceModal(props: SequenceModalProps) {
  const { actionName, handleSubmit, id, modalTitle, handleClose } = props

  const {
    editingSequence,
    editingBoardID,
    updateSequenceName,
    updateSequenceOrder,
    boards,
    getSounds,
    setPlaying,
    setStopped
  } = useAudioStore(
    useShallow((state) => ({
      editingSequence: state.editingSequence,
      editingBoardID: state.editingBoardID,
      updateSequenceName: state.updateSequenceName,
      updateSequenceOrder: state.updateSequenceElements,
      boards: state.boards,
      getSounds: state.getSounds,
      setPlaying: state.markSequenceElementAsPlaying,
      setStopped: state.markSequenceElementAsStopped
    }))
  )

  const [isPlaying, setIsPlaying] = useState(false)
  const previewContainerRef = useRef<SequenceSoundContainer | null>(null)

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
      ...(editingSequence?.sequence ?? []),
      { type: 'delay', id: `seq-${crypto.randomUUID()}`, msToDelay: 0 }
    ])

  const previewSound = async () => {
    const effectPromises = SequenceSoundContainer.ApiToSetupElements(
      editingSequence?.sequence ?? [],
      getSounds
    )

    const effects = await Promise.all(effectPromises)

    const newContainer = new SequenceSoundContainer({
      effectGroups: effects,
      elementPlayingHandler(sequence) {
        setPlaying(sequence)
      },
      elementStoppedHandler(sequence) {
        setStopped(sequence)
      },
      stoppedHandler: {
        id: '',
        handler: () => setIsPlaying(false)
      }
    })

    await newContainer.Init()

    previewContainerRef.current = newContainer
    newContainer.Play()
    setIsPlaying(true)
  }

  const stopSound = () => {
    previewContainerRef.current?.Stop()
  }

  const onSubmit: MouseEventHandler = (e) => {
    let failToSubmit = false
    if (editingSequence === null) {
      failToSubmit = true
      return
    }

    if (!editingSequence.name) {
      failToSubmit = true
      setEffectNameErr('This field is required')
    } else {
      setEffectNameErr('')
    }

    if (editingSequence.sequence.filter((s) => s.type === 'group').length <= 0) {
      failToSubmit = true
      setSequenceErr('A sequence needs at least one sound')
    } else {
      setSequenceErr('')
    }

    if (failToSubmit || editingBoardID === undefined) {
      e.preventDefault()
      return
    }

    handleSubmit({
      ...editingSequence,
      boardID: editingBoardID
    })
  }

  const [effectNameErr, setEffectNameErr] = useState('')
  const [sequenceErr, setSequenceErr] = useState('')

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
      <div className="modal-box min-w-4/5 max-h-2/3 h-2/3 overflow-visible relative grid grid-rows-[min-content_1fr_min-content]">
        <h3 className="font-bold text-lg">{modalTitle}</h3>
        <div
          className={`
            grid
            py-2
            [grid-template-areas:"iconpreview_iconlookup"_"sequence_picker"_"controls_controls"]
            grid-rows-[1fr_1fr_min-content]
            grid-cols-2
            gap-2
          `}
        >
          <div
            className={`
              grid
              [grid-area:iconpreview]
              [grid-template-areas:"icon_icon_name"_"foreground_background_."]
              grid-cols-[min-content_max-content]
              items-start
              justify-items-center
            `}
          >
            <TextField
              required
              className="[grid-area:name]"
              fieldName="Name"
              value={editingSequence?.name}
              error={effectNameErr}
              placeholder="My Sequence"
              onChange={(e) => updateSequenceName(e.target.value)}
            />
            <IconEffect className="[grid-area:icon] self-end" icon={editingSequence?.icon} />
            <ForegroundPicker
              className="[grid-area:foreground] w-full justify-self-start"
              pickerID="sequence-foreground"
            />
            <BackgroundPicker
              className="[grid-area:background] w-full justify-self-end"
              pickerID="sequence-background"
            />
          </div>
          <IconLookup className="[grid-area:iconlookup]" />
          <DndContext
            modifiers={[snapCenterToCursor]}
            onDragStart={onDragFromSelect}
            onDragEnd={onDragEnd}
          >
            <SequenceEditingZone errorText={sequenceErr} />
            <GroupLookup />
            <DragOverlay adjustScale={false}>{getOverlaidItem(draggingID)}</DragOverlay>
          </DndContext>
          <div className="join [grid-area:controls]">
            <button className="join-item btn btn-secondary" onClick={newBlankElement}>
              New Delay
            </button>
            <div className="relative">
              <button
                className={`btn join-item btn-primary ${isPlaying ? 'hidden' : 'visible'}`}
                onClick={previewSound}
              >
                Preview
                <SoundIcon />
              </button>
              <button
                className={`btn btn-primary ${isPlaying ? 'visible' : 'hidden'}`}
                onClick={stopSound}
              >
                Stop
                <StopIcon />
              </button>
            </div>
          </div>
        </div>
        <div className="modal-action">
          <form method="dialog">
            <button className="btn btn-primary" onClick={onSubmit}>
              {actionName}
            </button>
          </form>
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

  const group = getGroup(id)
  if (group.type !== 'source') {
    return null
  }

  return <SelectorElement g={group} />
}
