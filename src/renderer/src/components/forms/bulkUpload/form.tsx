import { useEffect, useState } from 'react'
import { BulkButtonStates } from './types'
import { BulkFiles } from './files'
import { useNavigate } from '@tanstack/react-router'

enum CreationStates {
  Ready,
  NeedsInput,
  Creating
}

export function BulkUploadFiles() {
  const [bulkButtons, setBulkButtons] = useState<BulkButtonStates>({})
  const [creationState, setCreationState] = useState<CreationStates>(CreationStates.NeedsInput)
  const allButtons = Object.values(bulkButtons).filter((b) => b.state == 'loaded')
  const nav = useNavigate()

  useEffect(() => {
    if (allButtons.length === 0) {
      setCreationState(CreationStates.NeedsInput)
      return
    }

    setCreationState(CreationStates.Ready)
    return
  }, [allButtons])

  const onCreate = () => {
    setCreationState(CreationStates.Creating)
    allButtons.forEach((b) => {
      window.audio.Groups.Create(b.button)
    })
    nav({ to: '/' })
    // TODO: Update board
  }

  const showCreate = [CreationStates.Ready, CreationStates.NeedsInput].includes(creationState)

  return (
    <div
      className={`
        gap-8
        grid
        grid-rows-[1fr_min-content]
        max-h-[500px]
      `}
    >
      <BulkFiles bulkButtons={bulkButtons} setBulkButtons={setBulkButtons} />
      <div className="place-self-center">
        {showCreate && (
          <div className="flex gap-2">
            <CreateButton
              disabled={creationState !== CreationStates.Ready}
              length={allButtons.length}
              onCreate={onCreate}
            />
            <button className="btn btn-error" onClick={() => setBulkButtons({})}>
              Clear
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

type CreateButtonProps = {
  onCreate: () => void
  length: number
  disabled: boolean
}

function CreateButton(props: CreateButtonProps) {
  const { length, onCreate, disabled } = props

  return (
    <button
      disabled={disabled}
      className={`
          btn
          btn-primary
          w-fit
        `}
      onClick={onCreate}
    >
      Create {length} Buttons
    </button>
  )
}
