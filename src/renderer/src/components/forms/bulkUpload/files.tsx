import { useEffect, useRef } from 'react'
import { BulkButtonList } from './buttonList'
import { BulkButtonStates, BulkButtonLoading, BulkButtonLoaded } from './types'
import { produce } from 'immer'

export type BulkFilesProps = {
  bulkButtons: BulkButtonStates
  setBulkButtons: React.Dispatch<React.SetStateAction<BulkButtonStates>>
}

export function BulkFiles(props: BulkFilesProps) {
  const { bulkButtons, setBulkButtons } = props

  const hasAnyButtons = Object.keys(bulkButtons).length > 0
  const inputRef = useRef<HTMLInputElement | null>(null)

  const onDrop = async (event: React.ChangeEvent<HTMLInputElement, HTMLInputElement>) => {
    const files: File[] = []
    const eventFiles = event.target.files
    if (eventFiles === null) {
      return
    }

    for (let i = 0; i < (eventFiles.length ?? 0); i++) {
      const f = eventFiles.item(i)
      if (f === null) {
        continue
      }
      files.push(f)
    }

    const acceptedFilesAsButtons: BulkButtonStates = files.reduce<BulkButtonStates>((acc, curr) => {
      const f = event['dataTransfer']
      console.log(f)

      const { webUtils } = require('electron')
      const path = webUtils.getPathForFile(curr)
      const nonNumberedName = curr.name
        // Extension
        .replace(/\.\w+/g, '')
        // Ending numbers
        .replace(/\s*[0-9]+$/g, '')
        // Prefixed category name
        .replace(/(^\w+\s?-\s?)/g, '')
        // Any missed whitespace on the edge
        .trim()

      if (acc[nonNumberedName] === undefined) {
        acc[nonNumberedName] = {
          state: 'loading',
          filePaths: [],
          name: nonNumberedName
        }
      }

      ;(acc[nonNumberedName] as BulkButtonLoading).filePaths.push(path)

      return acc
    }, {} as BulkButtonStates)

    setBulkButtons(acceptedFilesAsButtons)
  }

  useEffect(() => {
    Object.entries(bulkButtons)
      .filter(([_, button]) => button.state === 'loading')
      .forEach(async ([key, button]) => {
        const loadedButton = await loadButton(button as BulkButtonLoading)
        setBulkButtons((prevState) =>
          produce(prevState, (draft) => {
            draft[key] = loadedButton
          })
        )
      })
  }, [bulkButtons])

  const isDragActive = false

  return (
    <div
      className={`
          overflow-y-scroll
          bg-base-100
          rounded-md
          shadow-md
          relative
        `}
    >
      <div
        className={`
            border-2
            border-dashed
            rounded-md
            transition-colors
            absolute
            top-0
            left-0
            w-full
            h-full
            ${hasAnyButtons && !isDragActive ? 'hidden' : 'visible'}
            ${isDragActive ? 'border-blue-300' : ''}
          `}
      >
        <p
          className={`
              absolute
              left-1/2
              top-1/2
              -translate-1/2
              ${
                isDragActive
                  ? 'background-animate bg-gradient-to-r from-indigo-500 via-green-500 to-pink-500 bg-clip-text text-transparent select-none'
                  : 'text-white'
              }
            `}
        >
          Drop Files Here
        </p>
        <input
          type="file"
          multiple
          ref={inputRef}
          onChange={(e) => onDrop(e)}
          accept="audio/*"
          className={`
            absolute
            w-full
            h-full
            input
            file-input
          `}
        />
      </div>
      <div className="relative">
        <BulkButtonList buttons={Object.values(bulkButtons)} />
      </div>
    </div>
  )
}

async function loadButton(loadingButton: BulkButtonLoading): Promise<BulkButtonLoaded> {
  const bestIcon = await window.audio.Icons.GenGroupInput({
    filePaths: loadingButton.filePaths,
    name: loadingButton.name
  })

  return {
    state: 'loaded',
    button: bestIcon.group,
    name: loadingButton.name
  }
}
