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
  onLoad?: () => void
  onPlay?: () => void
  onStop?: () => void
}

export const RpgAudioNodeEvent = {
  stop: 0,
  play: 1,
  load: 2,
  errr: 3
}

export type RpgAudioNodeEvent = keyof typeof RpgAudioNodeEvent

export interface RpgAudioNode {
  getDuration(): Promise<number>
  connect(
    destinationNode: AudioNode,
    output?: number | undefined,
    input?: number | undefined
  ): AudioNode
  play(): Promise<void>
  stop(): Promise<void>
  on(eventType: RpgAudioNodeEvent, handler: () => void): void
}
