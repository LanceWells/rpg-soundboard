import IconLookup from '@renderer/components/effect/iconLookup'
import { GroupIcon } from '@renderer/componentsV2/board/icon/base'
import { FormProvider, SubmitHandler, useForm, useFormContext } from 'react-hook-form'
import { FormInput, ColorOptions, GroupFormInput, SequenceFormInput } from './types'
import { FileSelectInput } from './components/fileSelectInput'
import { FileSelectList } from './components/fileSelectList'
import { Tag, TagInput } from './components/tagInput'

export function CreateSoundForm() {
  const methods = useForm<FormInput>({
    defaultValues: {
      type: 'group',
      request: {
        effects: [],
        icon: {
          foregroundColor: ColorOptions['white'],
          name: 'moon',
          type: 'svg'
        },
        name: '',
        tags: [],
        type: 'source',
        variant: 'Default'
      }
    }
  })

  const { register, watch, setValue } = methods

  const onSubmit: SubmitHandler<FormInput> = (data) => {
    console.log(data)
  }

  const formType = watch('type')
  const tags = watch('request.tags')

  return (
    <div
      className={`
        p-8
        h-dvh
        max-h-dvh
        overflow-y-scroll
        relative
      `}
    >
      <FormProvider {...methods}>
        <form
          className={`
            flex
            flex-col
            items-center
            [&>fieldset]:max-w-[550px]
            [&>fieldset]:w-[550px]
          `}
          onSubmit={methods.handleSubmit(onSubmit)}
        >
          <GroupIcon
            icon={{
              foregroundColor: watch('request.icon.foregroundColor'),
              name: watch('request.icon.name'),
              type: 'svg'
            }}
          />
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Name</legend>
            <input
              placeholder="My Button"
              type="text"
              className="input"
              required
              {...register('request.name')}
            />
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Color</legend>
            <select {...register('request.icon.foregroundColor')} className="select">
              {Object.entries(ColorOptions).map(([colorName, hex]) => (
                <option value={hex} style={{ color: hex }}>
                  {colorName}
                </option>
              ))}
            </select>
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Icon</legend>
            <input type="text" className="hidden" {...register('request.icon.name')} />
            <IconLookup
              fgColor="white"
              onClick={(newIcon) => setValue('request.icon.name', newIcon)}
            />
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Tags</legend>
            <TagInput />
            <div className="max-w-[320px] flex gap-1 flex-wrap">
              {tags.map((t) => (
                <Tag
                  key={t}
                  text={t}
                  onRemove={(nt) =>
                    setValue(
                      'request.tags',
                      tags.filter((t) => t !== nt)
                    )
                  }
                />
              ))}
            </div>
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Button Type</legend>
            <select {...register('type')} className="select">
              <option value="group">Group</option>
              <option value="sequence">Sequence</option>
            </select>
          </fieldset>
          {formType === 'group' && <CreateGroupForm />}
          {formType === 'sequence' && <CreateSequenceForm />}
          <input className="btn btn-primary" value="Create Button" type="submit" />
        </form>
      </FormProvider>
    </div>
  )
}

function CreateGroupForm() {
  return (
    <>
      <fieldset className="fieldset">
        <legend className="fieldset-legend">Upload Sounds</legend>
        <FileSelectInput />
        <FileSelectList />
      </fieldset>
    </>
  )
}

function CreateSequenceForm() {
  // const { register } = useFormContext<SequenceFormInput>()

  return (
    <>
      <fieldset className="grid grid-cols-[120px_1fr] gap-y-4 my-4">
        <legend>Details</legend>
        <label htmlFor="name">Name</label>
        <select>
          <option>df</option>
        </select>
      </fieldset>
    </>
  )
}
