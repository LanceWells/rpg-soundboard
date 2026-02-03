import { SoundVariants } from 'src/apis/audio/types/soundVariants'
import { ISoundContainer, SoundContainerSetup } from './interface'
import { EffectID } from 'src/apis/audio/types/effects'
import { SoundEffectWithPlayerDetails } from 'src/apis/audio/types/groups'
import { getRandomInt } from '../random'
import { Ctx, ListenerType, RpgAudio } from '../audioCtx'

export abstract class AbstractSoundContainerV2<
  TStopped extends string = string,
  TLoaded extends string = string,
  TPlaying extends string = string
> implements ISoundContainer
{
  protected _lastEffectID: EffectID | undefined
  protected readonly targetVolume
  protected _loadedEffect: SoundEffectWithPlayerDetails
  protected rpgAudio: RpgAudio
  protected fadeTime: number = 250

  public abstract Variant: SoundVariants

  protected getCtx(): Ctx {
    return Ctx.Environmental
  }

  protected SelectEffect(effects: SoundEffectWithPlayerDetails[]): SoundEffectWithPlayerDetails {
    const effectIndex = getRandomInt(0, effects.length - 1)
    return effects[effectIndex]
  }

  protected constructor(
    setup: SoundContainerSetup<TStopped, TLoaded, TPlaying>,
    loop: boolean,
    lastEffectID?: EffectID
  ) {
    const { effects, stopHandler, loadedHandler } = setup

    this._lastEffectID = lastEffectID
    this._loadedEffect = this.SelectEffect(effects)
    this.targetVolume = this._loadedEffect.volume / 100

    const audio = new RpgAudio({
      ctx: this.getCtx(),
      loop,
      paths: [this._loadedEffect.path],
      volume: this.targetVolume
    })

    this.rpgAudio = audio

    if (loadedHandler) {
      this.rpgAudio.on(
        ListenerType.Load,
        (() => {
          loadedHandler.handler(loadedHandler.id, this)
        }).bind(this)
      )
    }

    if (stopHandler) {
      this.rpgAudio.on(
        ListenerType.Stop,
        (() => {
          stopHandler.handler(stopHandler.id, this)
        }).bind(this)
      )
    }
  }

  Play(): void {
    this.rpgAudio.play()
  }

  Stop(): void {
    this.rpgAudio.stop()
  }

  ChangeVolume(volume: number): void {
    this.rpgAudio.setVolume(volume)
  }

  Fade(ratio: number): void {
    const newVolume = this.rpgAudio.volume * ratio
    this.rpgAudio.fade(newVolume, this.fadeTime)
  }

  LoadedEffectID: `eff-${string}-${string}-${string}-${string}-${string}` | undefined

  Duration: number | undefined

  async GetDuration() {
    return await this.rpgAudio.getDuration()
  }
}
