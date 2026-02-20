import IconLookup from '@renderer/components/effect/iconLookup'
import { GroupIcon } from '@renderer/componentsV2/board/icon/base'
import { FormProvider, SubmitHandler, useForm, useFormContext } from 'react-hook-form'
import { FormInput, ColorOptions, GroupFormInput, SequenceFormInput } from './types'
import { FileSelectInput } from './components/fileSelectInput'
import { FileSelectList } from './components/fileSelectList'

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

  return (
    <div
      className={`
       
      `}
    >
      <FormProvider {...methods}>
        <form
          className={`
            flex
            flex-col
            m-4
            justify-center
            h-full
            max-h-full
            items-center
            [&>fieldset]:max-w-[550px]
            [&>fieldset]:w-[550px]
          `}
          onSubmit={methods.handleSubmit(onSubmit)}
        >
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Name</legend>
            <input
              placeholder="My Button"
              type="text"
              className="input"
              {...register('request.name')}
            />
          </fieldset>
          <GroupIcon
            icon={{
              foregroundColor: watch('request.icon.foregroundColor'),
              name: watch('request.icon.name'),
              type: 'svg'
            }}
          />
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
            <legend className="fieldset-legend">Button Type</legend>
            <select {...register('type')} className="select">
              <option value="group">Group</option>
              <option value="sequence">Sequence</option>
            </select>
          </fieldset>
          {formType === 'group' && <CreateGroupForm />}
          {formType === 'sequence' && <CreateSequenceForm />}
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
