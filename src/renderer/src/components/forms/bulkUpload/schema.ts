import * as z from 'zod'
import { FormInput } from './types'
import { CreateRequestSchema } from '../sound/util/schema'

export const FormInputSchema: z.ZodType<FormInput> = z.object({
  bulkSounds: z.array(
    z.discriminatedUnion('state', [
      z.object({
        state: z.literal('loading'),
        name: z.string().min(1),
        filePaths: z.array(z.string()).min(1)
      }),
      z.object({
        state: z.literal('loaded'),
        name: z.string().min(1),
        button: CreateRequestSchema
      })
    ])
  ),
  tags: z.array(z.string())
})
