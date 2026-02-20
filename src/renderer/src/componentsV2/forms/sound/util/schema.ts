import { CreateRequest, GroupID, CreateSequenceRequest } from 'src/apis/audio/types/groups'
import {
  SvgSoundIcon,
  SoundEffectEditableFields,
  SoundGroupSequenceGroup,
  SequenceElementID,
  SoundGroupSequenceDelay,
  SoundGroupSequenceElement
} from 'src/apis/audio/types/items'
import * as z from 'zod'
import { GroupFormInput, SequenceFormInput, FormInput } from '../types'

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
  variant: z.enum(['Default', 'Looping', 'Rapid', 'Soundtrack', 'Sequence']),
  name: z.string(),
  icon: z.union([SvgIconSchema]),
  tags: z.array(z.string()).min(0)
})

const SoundGroupSequenceGroupSchema: z.ZodType<SoundGroupSequenceGroup> = z.object({
  groupID: z.string() as z.ZodType<GroupID>,
  id: z.string() as z.ZodType<SequenceElementID>,
  type: z.literal('group')
})

const SoundGroupSequenceDelaySchema: z.ZodType<SoundGroupSequenceDelay> = z.object({
  id: z.string() as z.ZodType<SequenceElementID>,
  type: z.literal('delay'),
  msToDelay: z.number()
})

const SoundGroupElementSchema: z.ZodType<SoundGroupSequenceElement> = z.union([
  SoundGroupSequenceGroupSchema,
  SoundGroupSequenceDelaySchema
])

const CreateSequenceSchema: z.ZodType<CreateSequenceRequest> = z.object({
  icon: z.union([SvgIconSchema]),
  name: z.string(),
  tags: z.array(z.string()).min(0),
  variant: z.enum(['Default', 'Looping', 'Rapid', 'Soundtrack', 'Sequence']),
  type: z.literal('sequence'),
  sequence: z.array(SoundGroupElementSchema)
})

const GroupFormInputSchema: z.ZodType<GroupFormInput> = z.object({
  type: z.literal('group'),
  request: CreateRequestSchema
})

const SequenceFormInputSchema: z.ZodType<SequenceFormInput> = z.object({
  type: z.literal('sequence'),
  request: CreateSequenceSchema
})

export const FormInputSchema: z.ZodType<FormInput, any> = z.union([
  GroupFormInputSchema,
  SequenceFormInputSchema
])
