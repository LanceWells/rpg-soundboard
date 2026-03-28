import { SupportedFileTypes } from 'src/apis/audio/supportedFileTypes'
import { RpgAudioConvolverNode } from './node/convolver'
import { RpgAudio } from './rpgAudio'

/**
 * Selects the audio processing context (environmental reverb, soundtrack, or dry/effectless).
 */
export enum Ctx {
  Environmental,
  Soundtrack,
  Effectless
}

/**
 * Event types that audio nodes can emit.
 */
export enum ListenerType {
  Load,
  Stop,
  Play
}

/**
 * Configuration passed to an RpgAudio instance when creating a new audio player.
 */
export type RpgAudioConfig = {
  path: string
  volume: number
  loop: boolean
  ctx: Ctx
  isLargeFile: boolean
  format: SupportedFileTypes
  onLoad?: (audio: RpgAudio) => void
  onPlay?: (audio: RpgAudio) => void
  onStop?: (audio: RpgAudio) => void
}

/**
 * Configuration for a RandomReverbNode; requires at least one convolver node.
 */
export type RandomReverbNodeConfig = {
  nodes: [RpgAudioConvolverNode, ...RpgAudioConvolverNode[]]
}

/**
 * Lifecycle states of an RpgAudio player node.
 */
export enum RpgAudioState {
  Loading,
  Ready,
  Playing,
  Stopped,
  Error
}

/**
 * Enumeration of event names that can be emitted by audio nodes.
 */
export const RpgAudioNodeEvent = {
  stop: 0,
  play: 1,
  load: 2,
  errr: 3
}

/**
 * String union type of valid audio node event names.
 */
export type RpgAudioNodeEvent = keyof typeof RpgAudioNodeEvent

/**
 * An audio node that can be played, stopped, panned, and rate-adjusted.
 */
export interface IRpgAudioPlayableNode extends IRpgAudioNode {
  getDuration(): Promise<number>

  play(): Promise<void>
  stop(): Promise<void>
  rate(rate: number): Promise<void>
  pan(pan: number): Promise<void>
  on(eventType: RpgAudioNodeEvent, handler: () => void): void
}

/**
 * Base interface for connectable audio nodes that support event listeners.
 */
export interface IRpgAudioNode {
  on(eventType: RpgAudioNodeEvent, handler: () => void): void
  connect(
    destinationNode: AudioNode,
    output?: number | undefined,
    input?: number | undefined
  ): AudioNode
  disconnect(): void
}
