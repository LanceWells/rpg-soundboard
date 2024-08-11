import fs from 'node:fs'
import path from 'node:path'
import { Sounds } from '../interface'
import { SupportedFileTypes } from '../supportedFileTypes'

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

    const srcFileData = path.parse(request.effect.path)

    return {
      format: srcFileData.ext as SupportedFileTypes,
      soundB64: r?.toString() ?? '',
      volume: request.effect.volume
    }
  }
}
