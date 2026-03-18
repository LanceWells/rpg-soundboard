import { produce } from 'immer'
import { useState, useCallback, useEffect } from 'react'
import { FileRejection, DropEvent, useDropzone } from 'react-dropzone'
import { BulkButtonList } from './buttonList'
import { BulkButtonStates, BulkButtonLoading, BulkButtonLoaded } from './types'

export function BulkUploadFiles() {
  const [bulkButtons, setBulkButtons] = useState<BulkButtonStates>({})
  const buttonsLoading = Object.values(bulkButtons).some((b) => b.state === 'loading')
  const hasAnyButtons = Object.keys(bulkButtons).length > 0

  const onDrop = useCallback(
    async (acceptedFiles: File[], _fileRejections: FileRejection[], _event: DropEvent) => {
      const acceptedFilesAsButtons: BulkButtonStates = acceptedFiles.reduce<BulkButtonStates>(
        (acc, curr) => {
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
        },
        {}
      )

      setBulkButtons(acceptedFilesAsButtons)
    },
    []
  )

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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: buttonsLoading,
    noClick: true
  })

  return (
    <div
      {...getRootProps()}
      className={`
        overflow-y-scroll
        bg-base-100
        rounded-md
        shadow-md
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
        <input {...getInputProps()} />
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
