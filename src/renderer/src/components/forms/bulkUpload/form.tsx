import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { BulkButtonLoaded, BulkButtonLoading, BulkButtonStates, FormInput } from './types'
import { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { GenButtonLoaded, GenButtonLoading } from './genButton'
import { CloseIcon } from '@renderer/assets/icons'
import { Tag, TagInput } from '../sound/components/tagInput'
import { useNavigate } from '@tanstack/react-router'

export function BulkUploadFiles() {
  const methods = useForm<FormInput>({
    defaultValues: {
      bulkSounds: [],
      tags: []
    }
  })

  const nav = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { formState, handleSubmit, setValue, watch } = methods

  const buttons = watch('bulkSounds')
  const tags = watch('tags')

  const onSubmit = async (data: FormInput) => {
    const groups = data.bulkSounds.filter((b) => b.state === 'loaded').map((b) => b.button)

    await window.audio.Groups.CreateBulk({
      commonTags: data.tags,
      groups
    })

    nav({ to: '/' })
  }

  const onClear = () => {
    setValue('bulkSounds', [])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

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
      const { webUtils } = require('electron')
      const path = webUtils.getPathForFile(curr)
      const nonNumberedName = curr.name
        // Extension
        .replace(/\.[\w]+/g, '')
        // Ending numbers
        .replace(/\s*[0-9]+$/g, '')
        // Prefixed category name
        .replace(/(^[\w\s]+\s?-\s?)/g, '')
        // Replace underscores with spaces
        .replaceAll('_', ' ')
        // Replace any prefixed, all-caps wo
        .replaceAll('^[A-Z\s]+\s(?=[\w\s]{1,})', '')
        // Any missed whitespace on the edge
        .trim()

      const entireWordIsCaps = nonNumberedName.toUpperCase() === nonNumberedName
      const sanitizedName = entireWordIsCaps
        ? nonNumberedName
        : nonNumberedName.replace(/^[A-Z\s]+\s(?=[\w\s]{1,})/g, '')

      if (acc[sanitizedName] === undefined) {
        acc[sanitizedName] = {
          state: 'loading',
          filePaths: [],
          name: sanitizedName
        }
      }

      ;(acc[sanitizedName] as BulkButtonLoading).filePaths.push(path)

      return acc
    }, {} as BulkButtonStates)

    const buttons = Object.values(acceptedFilesAsButtons)

    const loadedButtons = await Promise.all(
      buttons
        .filter((button) => button.state === 'loading')
        .map(async (button) => {
          const loadedButton = await loadButton(button as BulkButtonLoading)
          return loadedButton
        })
    )

    setValue('bulkSounds', loadedButtons)
  }

  return (
    <FormProvider {...methods}>
      <p
        className={`
          text-error
          ${formState.isSubmitted && !formState.isValid ? 'visible' : 'hidden'}
        `}
      >
        There were some problems with the form.
        {formState.errors.root?.message ?? ''}
      </p>
      <form
        className={`
          flex
          flex-col
          items-center
          [&>fieldset]:max-w-[400px]
          [&>fieldset]:w-[400px]
        `}
        onSubmit={handleSubmit(onSubmit)}
      >
        <fieldset className="fieldset">
          <legend className="fieldset-legend">Buttons</legend>
          <input
            ref={fileInputRef}
            className={`
              file-input w-full
            `}
            type="file"
            multiple
            onChange={(e) => onDrop(e)}
          />
          <ButtonList />
          <div onClick={onClear} role="button" className="btn btn-error w-min place-self-center">
            Clear
            <CloseIcon />
          </div>
        </fieldset>
        <fieldset className="fieldset">
          <legend className="fieldset-legend">Tags</legend>
          <TagInput tags={tags} setTags={(newTags) => setValue('tags', newTags)} />
          <div className="max-w-[320px] flex gap-1 flex-wrap">
            {tags.map((t) => (
              <Tag
                key={t}
                text={t}
                onRemove={(nt) =>
                  setValue(
                    'tags',
                    tags.filter((t) => t !== nt)
                  )
                }
              />
            ))}
          </div>
        </fieldset>
        <input
          disabled={buttons.length === 0 || formState.isSubmitting}
          className={`
            btn
            btn-primary
            m-4
            w-50
            relative
            z-10
            before:z-30
            ${
              formState.isSubmitting
                ? `
                btn-disabled
                `
                : ''
            }
          `}
          value="Save"
          type="submit"
        />
      </form>
    </FormProvider>
  )
}

function ButtonList() {
  const { watch } = useFormContext<FormInput>()

  const buttons = watch('bulkSounds')

  const parentRef = useRef<HTMLDivElement | null>(null)

  const rowVirtualizer = useVirtualizer({
    count: buttons.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120,
    overscan: 2,
    enabled: true
  })

  return (
    <div
      ref={parentRef}
      className={`
        w-full
        bg-base-100
        h-[400px]
        h-max-[400px]
        flex
        rounded-md
        shadow-md
        overflow-y-scroll
      `}
    >
      <div
        className="flex w-full relative"
        style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualItem) => {
          const item = buttons[virtualItem.index]

          return (
            <div
              key={virtualItem.key}
              style={{
                transform: `translateY(${virtualItem.start}px)`
              }}
              className="absolute"
            >
              {item.state === 'loading' && <GenButtonLoading />}
              {item.state === 'loaded' && <GenButtonLoaded button={item.button} />}
            </div>
          )
        })}
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
