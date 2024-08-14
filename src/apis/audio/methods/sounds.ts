import fs from 'node:fs'
import path from 'node:path'
import { Sounds } from '../interface'
import { SupportedFileTypes } from '../supportedFileTypes'
import { getFileSize } from './fs'
import { AudProtocolPrefix } from '../../audProtocol/aud'
import { GetAppDataPath } from '../../../utils/paths'
import ffmpeg from 'fluent-ffmpeg'
import { Stream } from 'node:stream'

const ffmpegPath = require('ffmpeg-static').replace('app.asar', 'app.asar.unpacked')
ffmpeg.setFfmpegPath(ffmpegPath)

const html5ThresholdSizeMb = 2

export const SoundsAudioAPI: Sounds = {
  Preview: async function (request) {
    const appDataDir = GetAppDataPath()
    const actualPath = request.effect.path.startsWith(AudProtocolPrefix)
      ? request.effect.path.replace(`${AudProtocolPrefix}://`, appDataDir + '/')
      : request.effect.path

    const srcFilePath = path.parse(actualPath)
    const formattedPath = path.format(srcFilePath).replaceAll('/', '\\')
    const s = new Stream.PassThrough()

    const w = new Stream.Writable()

    ffmpeg(formattedPath)
      .duration(15)
      // .output('./test.ogg')
      .output(w, { end: true })
      .on('error', (err) => {
        console.error(err)
      })
      // .on('finish', () => {
      //   console.log('finish')
      // })
      // .on('close', () => {
      //   console.log('finish')
      // })
      // .on('drain', () => {
      //   console.log('finish')
      // })
      // .on('pipe', () => {
      //   console.log('finish')
      // })
      // .on('unpipe', () => {
      //   console.log('finish')
      // })
      .run()

    const buffers: unknown[] = []

    s.on('data', function (buf: unknown) {
      if (Array.isArray(buf as unknown)) {
        buffers.push(...(buf as unknown[]))
      }
      buffers.push(buf)
    })

    await new Promise<void>((resolve) => {
      s.addListener('end', function () {
        resolve()
      })
    })

    // const reader = new FileReader()

    // const file = fs.readFileSync(actualPath)
    // const blob = new Blob([file.buffer])

    // reader.readAsDataURL(blob)
    // await new Promise<void>((resolve) => {
    //   reader.addEventListener('load', () => {
    //     resolve()
    //   })
    // })

    // const r = reader.result

    const srcFileSizeInMb = await getFileSize(actualPath)
    const useHtml5 = srcFileSizeInMb > html5ThresholdSizeMb

    return {
      format: srcFilePath.ext as SupportedFileTypes,
      // soundB64: r?.toString() ?? '',
      soundB64: '',
      volume: request.effect.volume,
      useHtml5
    }
  }
}
