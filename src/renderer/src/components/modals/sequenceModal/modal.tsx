import { useAudioStore } from '@renderer/stores/audio/audioStore'
import { MouseEventHandler, PropsWithChildren, useEffect, useMemo, useRef, useState } from 'react'
import { CreateSequenceRequest, GroupID } from 'src/apis/audio/types/groups'
import { useShallow } from 'zustand/react/shallow'
import TextField from '@renderer/components/generic/textField'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core'
import { produce } from 'immer'
import { SequenceElementID } from 'src/apis/audio/types/items'
import { snapCenterToCursor } from '@dnd-kit/modifiers'
import { IdIsGroup } from '@renderer/utils/id'
import SequenceEditingZone, { dropZoneScrollContainerID, EditingDropZoneID } from './editingZone'
import { v4 as uuidv4 } from 'uuid'
import { usePrevious } from '@dnd-kit/utilities'
import SoundIcon from '@renderer/assets/icons/sound'
import { SequenceSoundContainer } from '@renderer/utils/soundContainer/variants/sequence'
import StopIcon from '@renderer/assets/icons/stop'
import IconLookup from '@renderer/components/effect/iconLookup'
import { IconEffect } from '@renderer/components/effect/icon-effect'
import GroupLookup from '@renderer/components/group/groupLookup'
import { SelectorElement } from './groupSelectorElement'
import CloseIcon from '@renderer/assets/icons/close'
import ColorPicker from '@renderer/components/icon/colorPicker'
import { Ctx } from '@renderer/rpgAudioEngine'

export type SequenceModalProps = {
  id: string
  handleSubmit: (req: CreateSequenceRequest) => void
  handleClose?: () => void
  actionName: string
  modalTitle: string
}

export default function SequenceModal(props: PropsWithChildren<SequenceModalProps>) {
  const { actionName, handleSubmit, id, modalTitle, handleClose, children } = props

  const { editingSequence, editSequence, getSounds, setPlaying, groups } = useAudioStore(
    useShallow((state) => ({
      editingSequence: state.editingElementsV2.sequence,
      editSequence: state.updateEditingSequenceV2,
      groups: state.groups,
      getSounds: state.getSounds,
      setPlaying: state.setSequenceElementPlayingStatusV2
    }))
  )

  const [isPlaying, setIsPlaying] = useState(false)
  const previewContainerRef = useRef<SequenceSoundContainer | null>(null)

  const groupMap = useMemo(
    () => new Map(groups.filter((g) => g.type === 'source').map((g) => [g.id, g])),
    [groups]
  )

  const newBlankElement = () =>
    editSequence({
      sequence: [
        ...(editingSequence?.element?.sequence ?? []),
        { type: 'delay', id: `seq-${crypto.randomUUID()}`, msToDelay: 0 }
      ]
    })

  const previewSound = async () => {
    const effectPromises = SequenceSoundContainer.ApiToSetupElements(
      editingSequence?.element?.sequence ?? [],
      getSounds
    )

    const effects = await Promise.all(effectPromises)

    const newContainer = new SequenceSoundContainer(
      {
        effectGroups: effects,
        elementPlayingHandler(sequence) {
          setPlaying(sequence, true)
        },
        elementStoppedHandler(sequence) {
          setPlaying(sequence, false)
        },
        stoppedHandler: {
          id: '',
          handler: () => setIsPlaying(false)
        }
      },
      Ctx.Environmental
    )

    await newContainer.Init()

    previewContainerRef.current = newContainer
    newContainer.Play()
    setIsPlaying(true)
  }

  const stopSound = () => {
    previewContainerRef.current?.Stop()
  }

  const onSubmit: MouseEventHandler = (e) => {
    if (!editingSequence?.element) {
      console.error('Do not have an editing sequence')
      return
    }

    let failToSubmit = false
    if (editingSequence === null) {
      failToSubmit = true
      return
    }

    if (!editingSequence?.element?.name) {
      failToSubmit = true
      setEffectNameErr('This field is required')
    } else {
      setEffectNameErr('')
    }

    const editingSeq = editingSequence?.element?.sequence ?? []
    if (editingSeq.filter((s) => s.type === 'group').length <= 0) {
      failToSubmit = true
      setSequenceErr('A sequence needs at least one sound')
    } else {
      setSequenceErr('')
    }

    if (failToSubmit) {
      e.preventDefault()
      return
    }

    handleSubmit({
      ...editingSequence?.element
    })
  }

  const [effectNameErr, setEffectNameErr] = useState('')
  const [sequenceErr, setSequenceErr] = useState('')

  const seq = editingSequence?.element?.sequence ?? []
  const [draggingID, setDraggingID] = useState<GroupID | null>(null)
  const prevItemCount = usePrevious(editingSequence?.element?.sequence.length)

  useEffect(() => {
    const itemCount = editingSequence?.element?.sequence.length
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

    const activeObj = groupMap.get(activeID)
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

    editSequence({
      sequence: newSeq
    })

    return
  }

  const onDragFromSelect = (event: DragStartEvent) => {
    const activeID = event.active.id

    if (IdIsGroup(activeID)) {
      setDraggingID(activeID)
    }
  }

  const bgColor = editingSequence?.element?.icon.backgroundColor ?? 'grey'
  const fgColor = editingSequence?.element?.icon.foregroundColor ?? 'grey'
  const iconName = editingSequence?.element?.icon.name ?? 'moon'

  return (
    <dialog id={id} className="modal">
      <div className="modal-box min-w-fit overflow-visible relative">
        <h3 className="font-bold text-lg">{modalTitle}</h3>
        <div
          className={`
            grid
            gap-4
            [grid-template-areas:"iconpreview_iconlookup"_"sequence_picker"_"controls_controls"]
            grid-rows-[1fr_1fr_min-content]
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
              value={editingSequence?.element?.name}
              error={effectNameErr}
              placeholder="My Sequence"
              onChange={(e) => editSequence({ name: e.target.value })}
            />
            <IconEffect
              className="[grid-area:icon] self-end"
              icon={editingSequence?.element?.icon}
            />
            {/* <ForegroundPicker
              className="[grid-area:foreground] w-full justify-self-start"
              pickerID={`sequence-foreground-${actionName}`}
            />
            <BackgroundPicker
              className="[grid-area:background] w-full justify-self-end"
              pickerID={`sequence-background-${actionName}`}
            /> */}
            <ColorPicker
              pickerID={`sequence-foreground-${actionName}`}
              color={fgColor}
              onColorChange={function (hex: string): void {
                editSequence({
                  icon: {
                    backgroundColor: bgColor,
                    foregroundColor: hex,
                    name: iconName
                  }
                })
              }}
            />
            <ColorPicker
              pickerID={`sequence-background-${actionName}`}
              color={bgColor}
              onColorChange={function (hex: string): void {
                editSequence({
                  icon: {
                    backgroundColor: hex,
                    foregroundColor: fgColor,
                    name: iconName
                  }
                })
              }}
            />
          </div>
          <IconLookup
            bgColor={bgColor}
            fgColor={fgColor}
            onClick={(name) =>
              editSequence({
                icon: {
                  backgroundColor: bgColor,
                  foregroundColor: fgColor,
                  name
                }
              })
            }
            className="[grid-area:iconlookup] min-h-84 max-h-84"
          />
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
            <div className="flex justify-between">
              <div className="flex flex-row gap-2">{children}</div>
              <button className="btn btn-primary" onClick={onSubmit}>
                {actionName}
              </button>
            </div>
            <button
              onClick={handleClose}
              className="btn btn-circle absolute text-white font-bold -top-3 -right-3 bg-error"
            >
              <CloseIcon />
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
      getGroup: state.getGroupSource
    }))
  )

  if (id === null) {
    return null
  }

  const group = getGroup(id)

  return <SelectorElement g={group} style={{}} />
}
