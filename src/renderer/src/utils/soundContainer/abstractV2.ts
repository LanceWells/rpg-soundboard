import { SoundVariants } from 'src/apis/audio/types/soundVariants'
import { Handler, ISoundContainer, SoundContainerSetup } from './interface'
import { EffectID } from 'src/apis/audio/types/effects'
import { SoundEffectWithPlayerDetails } from 'src/apis/audio/types/groups'
import { getRandomInt } from '../random'
import { RpgAudio } from '../audioCtx'

export abstract class AbstractSoundContainerV2<
  TStopped extends string = string,
  TLoaded extends string = string,
  TPlaying extends string = string
> implements ISoundContainer
{
  private _stopHandler: Handler<TStopped> | undefined
  private _loadedHandler: Handler<TLoaded> | undefined
  private _playingHandler: Handler<TPlaying> | undefined
  protected _loadedEffect: SoundEffectWithPlayerDetails

  // private rpgAudio: RpgAudio

  public abstract Variant: SoundVariants

  protected selectEffect(effects: SoundEffectWithPlayerDetails[]): SoundEffectWithPlayerDetails {
    const effectIndex = getRandomInt(0, effects.length - 1)
    return effects[effectIndex]
  }

  protected constructor(
    setup: SoundContainerSetup<TStopped, TLoaded, TPlaying>,
    loop: boolean,
    lastEffectID?: EffectID
  ) {
    const { effects, stopHandler, loadedHandler } = setup

    this._loadedEffect = this.selectEffect(effects)
  }

  Play(): void {
    throw new Error('Method not implemented.')
  }

  Stop(): void {
    throw new Error('Method not implemented.')
  }

  ChangeVolume(volume: number): void {
    throw new Error('Method not implemented.')
  }

  Fade(ratio: number): void {
    throw new Error('Method not implemented.')
  }

  LoadedEffectID: `eff-${string}-${string}-${string}-${string}-${string}` | undefined
  Duration: number | undefined
}
