// import IconLookup from '@renderer/components/effect/iconLookup'
import { GroupIcon } from '@renderer/componentsV2/board/icon/base'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { FormInput, ColorOptions, GroupFormInput } from './types'
import { FileSelectInput } from './components/fileSelectInput'
import { FileSelectList } from './components/fileSelectList'
import { Tag, TagInput } from './components/tagInput'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormInputSchema } from './util/schema'
import { SoundVariant } from '@renderer/utils/soundVariants'
import { IconLookup } from '@renderer/componentsV2/board/icon/iconLookup'

type CreateEditSoundFormProps = {
  onSubmit: (data: FormInput) => void
  defaultValues: FormInput
}

export function CreateEditSoundForm(props: CreateEditSoundFormProps) {
  const { onSubmit: onSubmitParent, defaultValues } = props

  const methods = useForm<FormInput>({
    defaultValues,
    resolver: zodResolver(FormInputSchema)
  })

  const onSubmit = (data: FormInput) => {
    onSubmitParent(data)
  }

  const { register, watch, setValue, formState } = methods
  const formType = watch('type')
  const tags = watch('request.tags')
  const fgColor = watch('request.icon.foregroundColor')

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
              <option key={colorName} value={hex} style={{ color: hex }}>
                {colorName}
              </option>
            ))}
          </select>
        </fieldset>
        <fieldset className="fieldset">
          <legend className="fieldset-legend">Icon</legend>
          <input type="text" className="hidden" {...register('request.icon.name')} />
          <IconLookup
            fgColor={fgColor}
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
        <input className="btn btn-primary m-4 w-50" value="Save" type="submit" />
      </form>
    </FormProvider>
  )
}

function CreateGroupForm() {
  const { register, formState } = useFormContext<GroupFormInput>()

  const fileErrors = formState.errors?.request?.effects?.message ?? ''

  return (
    <>
      <fieldset className="fieldset">
        <legend className="fieldset-legend">Sound Variant</legend>
        <select className="select" {...register('request.variant')}>
          {Object.keys(SoundVariant).map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
      </fieldset>
      <fieldset className="fieldset">
        <legend className="fieldset-legend">Upload Sounds</legend>
        <p className="label text-error">{fileErrors}</p>
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
