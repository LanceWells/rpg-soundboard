import { CreateRequest, GroupID, CreateSequenceRequest } from 'src/apis/audio/types/groups'
import {
  SvgSoundIcon,
  SoundEffectEditableFields,
  SequenceElementID,
  SoundGroupSequenceElement
} from 'src/apis/audio/types/items'
import * as z from 'zod'
import { FormInput } from '../types'

const SvgIconSchema: z.ZodType<SvgSoundIcon> = z.object({
  foregroundColor: z.string().regex(/^#[a-f0-9]{6}/),
  name: z.string().min(1),
  type: z.literal('svg')
})

const EffectSchema: z.ZodType<SoundEffectEditableFields> = z.object({
  path: z.string(),
  volume: z.number().max(500).min(0),
  name: z.string()
})

const CreateRequestSchema: z.ZodType<CreateRequest> = z.object({
  effects: z.array(EffectSchema).min(1),
  type: z.literal('source'),
  variant: z.enum(['Default', 'Looping', 'Rapid', 'Soundtrack']),
  name: z.string(),
  icon: z.union([SvgIconSchema]),
  tags: z.array(z.string()).min(0)
})

const SoundGroupElementSchema: z.ZodType<SoundGroupSequenceElement> = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('group'),
    groupID: z.string() as z.ZodType<GroupID>,
    id: z.string() as z.ZodType<SequenceElementID>
  }),
  z.object({
    type: z.literal('delay'),
    id: z.string() as z.ZodType<SequenceElementID>,
    msToDelay: z.string().pipe(z.transform((val) => Number.parseInt(val)))
  })
])

const CreateSequenceSchema: z.ZodType<CreateSequenceRequest> = z.object({
  icon: z.union([SvgIconSchema]),
  name: z.string(),
  tags: z.array(z.string()).min(0),
  sequence: z.array(SoundGroupElementSchema)
})

export const FormInputSchema: z.ZodType<FormInput, any> = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('group'),
    request: CreateRequestSchema
  }),
  z.object({
    type: z.literal('sequence'),
    request: CreateSequenceSchema
  })
])
