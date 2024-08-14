import path from 'node:path'
import { Sounds } from '../interface'
import { SupportedFileTypes } from '../supportedFileTypes'
import { AudProtocolPrefix } from '../../audProtocol/aud'
import { GetAppDataPath } from '../../../utils/paths'
import ffmpeg from 'fluent-ffmpeg'
import { Stream } from 'node:stream'

const ffmpegPath = require('ffmpeg-static').replace('app.asar', 'app.asar.unpacked')
ffmpeg.setFfmpegPath(ffmpegPath)

export const SoundsAudioAPI: Sounds = {
  Preview: async function (request) {
    const appDataDir = GetAppDataPath()
    const actualPath = request.effect.path.startsWith(AudProtocolPrefix)
      ? request.effect.path.replace(`${AudProtocolPrefix}://`, appDataDir + '/')
      : request.effect.path

    const srcFilePath = path.parse(actualPath)
    const formattedPath = path.format(srcFilePath).replaceAll('/', '\\')
    const s = new Stream.PassThrough()

    ffmpeg(formattedPath)
      .audioCodec('libvorbis')
      .format('ogg')
      .duration(15)
      .output(s, { end: true })
      .on('error', (err) => {
        console.error(err)
      })
      .run()

    const buffers: number[] = []

    s.on('data', function (buf: number | number[]) {
      // is array didn't seem to be working.
      if ((buf as unknown[])[0] !== undefined) {
        buffers.push(...(buf as number[]))
      }
      buffers.push(buf as number)
    })

    await new Promise<void>((resolve) => {
      s.addListener('end', function () {
        resolve()
      })
    })

    const data = `data:audio/ogg;base64,${Buffer.from(buffers).toString('base64')}`
    const useHtml5 = true

    return {
      format: srcFilePath.ext as SupportedFileTypes,
      // soundB64: r?.toString() ?? '',
      soundB64: data,
      volume: request.effect.volume,
      useHtml5
    }
  }
}
