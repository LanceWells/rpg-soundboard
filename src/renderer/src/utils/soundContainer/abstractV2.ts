import { SoundVariants } from 'src/apis/audio/types/soundVariants'
import { ISoundContainer, SoundContainerSetup } from './interface'
import { EffectID } from 'src/apis/audio/types/effects'
import { SoundEffectWithPlayerDetails } from 'src/apis/audio/types/groups'
import { getRandomInt } from '../random'
import { Ctx, RpgAudio } from '@renderer/rpgAudioEngine'
// import { Ctx, ListenerType, RpgAudio } from '../audioCtx'

export abstract class AbstractSoundContainerV2<
  TStopped extends string = string,
  TLoaded extends string = string,
  TPlaying extends string = string
> implements ISoundContainer
{
  protected _lastEffectID: EffectID | undefined
  protected readonly targetVolume: number
  protected _loadedEffect: SoundEffectWithPlayerDetails
  protected rpgAudio: RpgAudio
  protected fadeTime: number = 250
  protected ctx: Ctx

  public abstract Variant: SoundVariants

  protected getCtx(): Ctx {
    return this.ctx
  }

  protected SelectEffect(effects: SoundEffectWithPlayerDetails[]): SoundEffectWithPlayerDetails {
    const effectIndex = getRandomInt(0, effects.length - 1)
    return effects[effectIndex]
  }

  protected constructor(
    setup: SoundContainerSetup<TStopped, TLoaded, TPlaying>,
    loop: boolean,
    lastEffectID?: EffectID,
    ctx?: Ctx
  ) {
    const { effects, stopHandler, loadedHandler } = setup

    this.ctx = ctx ?? Ctx.Effectless
    this._lastEffectID = lastEffectID
    this._loadedEffect = this.SelectEffect(effects)
    this.targetVolume = this._loadedEffect.volume / 100

    const onLoad = loadedHandler
      ? (() => {
          loadedHandler.handler(loadedHandler.id, this)
        }).bind(this)
      : undefined

    const onStop = stopHandler
      ? (() => {
          stopHandler.handler(stopHandler.id, this)
        }).bind(this)
      : undefined

    this.rpgAudio = new RpgAudio({
      ctx: this.getCtx(),
      loop,
      path: this._loadedEffect.path,
      volume: this.targetVolume,
      onLoad,
      onStop,
      isLargeFile: this._loadedEffect.useHtml5
    })
  }

  Play(): void {
    this.rpgAudio.play()
  }

  Stop(): void {
    this.rpgAudio.stop()
  }

  Rate(rate: number): void {
    this.rpgAudio.rate(rate)
  }

  Pan(pan: number): void {
    this.rpgAudio.pan(pan)
  }

  ChangeVolume(volume: number): void {
    this.rpgAudio.setVolume(volume)
  }

  Fade(ratio: number, fadeTime: number = this.fadeTime): void {
    this.rpgAudio.fade(ratio, fadeTime)
  }

  LoadedEffectID: `eff-${string}-${string}-${string}-${string}-${string}` | undefined

  Duration: number | undefined

  async GetDuration() {
    return await this.rpgAudio.getDuration()
  }
}
