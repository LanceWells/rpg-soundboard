import fs from 'node:fs'
import path from 'node:path'
import { Sounds } from '../interface'
import { SupportedFileTypes } from '../supportedFileTypes'
import { getFileSize } from './fs'

const html5ThresholdSizeMb = 2

export const SoundsAudioAPI: Sounds = {
  Preview: async function (request) {
    const reader = new FileReader()
    const file = fs.readFileSync(request.effect.path)
    const blob = new Blob([file.buffer])

    reader.readAsDataURL(blob)
    await new Promise<void>((resolve) => {
      reader.addEventListener('load', () => {
        resolve()
      })
    })

    const r = reader.result

    const srcFilePath = path.parse(request.effect.path)

    const srcFileSizeInMb = await getFileSize(request.effect.path)
    const useHtml5 = srcFileSizeInMb > html5ThresholdSizeMb

    return {
      format: srcFilePath.ext as SupportedFileTypes,
      soundB64: r?.toString() ?? '',
      volume: request.effect.volume,
      useHtml5
    }
  }
}
