import { RpgAudio } from './rpgAudio'

export enum Ctx {
  Environmental,
  Soundtrack,
  Effectless
}

export enum ListenerType {
  Load,
  Stop,
  Play
}

export type RpgAudioConfig = {
  path: string
  volume: number
  loop: boolean
  ctx: Ctx
  isLargeFile: boolean
  onLoad?: (audio: RpgAudio) => void
  onPlay?: (audio: RpgAudio) => void
  onStop?: (audio: RpgAudio) => void
}

export enum RpgAudioState {
  Loading,
  Ready,
  Playing,
  Stopped,
  Error
}

export const RpgAudioNodeEvent = {
  stop: 0,
  play: 1,
  load: 2,
  errr: 3
}

export type RpgAudioNodeEvent = keyof typeof RpgAudioNodeEvent

export interface IRpgAudioPlayableNode extends IRpgAudioNode {
  getDuration(): Promise<number>
  connect(
    destinationNode: AudioNode,
    output?: number | undefined,
    input?: number | undefined
  ): AudioNode
  play(): Promise<void>
  stop(): Promise<void>
  rate(rate: number): Promise<void>
  pan(pan: number): Promise<void>
  on(eventType: RpgAudioNodeEvent, handler: () => void): void
}

export interface IRpgAudioNode {
  on(eventType: RpgAudioNodeEvent, handler: () => void): void
}
