import { SoundVariants } from 'src/apis/audio/types/soundVariants'
import { Handler, ISoundContainer, SoundContainerSetup } from '../interface'
import { Ctx, ListenerType, RpgAudio, RpgAudioState } from '@renderer/rpgAudioEngine'
import { getRandomInt } from '@renderer/utils/random'
import { SoundEffectWithPlayerDetails } from 'src/apis/audio/types/groups'

type RpgAudioContainer = {
  targetVolume: number
  audio: RpgAudio
}

export class SoundtrackSoundContainerV2 implements ISoundContainer {
  public Variant: SoundVariants = 'Soundtrack'

  private readonly crossfadeTime: number = 2500
  private _fadeTime: number = 2500
  private _isActive: boolean = true

  private _audioQueue: [RpgAudioContainer, ...RpgAudioContainer[]]
  private ctx: Ctx
  private _effects: SoundEffectWithPlayerDetails[]
  private _loadedHandler: Handler<string> | undefined
  private _stopHandler: Handler<string> | undefined

  private timeouts: Set<NodeJS.Timeout> = new Set()

  private selectEffect(effects: SoundEffectWithPlayerDetails[]): SoundEffectWithPlayerDetails {
    const effectIndex = getRandomInt(0, effects.length - 1)
    return effects[effectIndex]
  }

  constructor(setup: SoundContainerSetup, ctx?: Ctx) {
    const { effects, stopHandler, loadedHandler } = setup

    this._effects = effects
    this._loadedHandler = loadedHandler
    this._stopHandler = stopHandler
    this.ctx = ctx ?? Ctx.Effectless

    const activeEffect = this.selectEffect(this._effects)
    const initialAudio = this.createAudio(activeEffect)
    initialAudio.audio.on(
      ListenerType.Load,
      (() => {
        if (this._loadedHandler) {
          this._loadedHandler.handler(this._loadedHandler.id, this)
        }
      }).bind(this)
    )

    this._audioQueue = [this.createAudio(activeEffect)]
  }

  private createAudio(effect: SoundEffectWithPlayerDetails): RpgAudioContainer {
    return {
      targetVolume: effect.volume / 100,
      audio: new RpgAudio({
        ctx: this.ctx,
        isLargeFile: effect.useHtml5,
        loop: false,
        path: effect.path,
        volume: 0
      })
    }
  }

  private async playSong(container: RpgAudioContainer, fadeInTime: number) {
    return new Promise<void>(async (res) => {
      container.audio.on(ListenerType.Stop, () => {
        res()
      })

      const activeMs = await container.audio.getDuration()
      const fadeOverMs = Math.min(activeMs / 10, this.crossfadeTime)
      const fadeInMs = activeMs - fadeOverMs

      container.audio.play()
      if (fadeInTime > 0) {
        container.audio.fade(container.targetVolume, fadeInTime)
      } else {
        container.audio.setVolume(container.targetVolume)
      }

      const fadeTimeout = setTimeout(
        (() => {
          this.timeouts.delete(fadeTimeout)
          container.audio.fade(0, fadeOverMs)

          const endFadeTimeout = setTimeout(
            (() => {
              this.timeouts.delete(endFadeTimeout)
              container.audio.stop()
            }).bind(this),
            fadeOverMs
          )

          this.timeouts.add(endFadeTimeout)

          // We can play the next song now, so go ahead and fulfill this promise.
          this._audioQueue.shift()
          res()
        }).bind(this),
        fadeInMs
      )

      this.timeouts.add(fadeTimeout)
    })
  }

  private async playQueue() {
    await this.playSong(this._audioQueue[0], 0)

    while (this._isActive) {
      const nextEffect = this.selectEffect(this._effects)
      this._audioQueue.push(this.createAudio(nextEffect))
      await this.playSong(this._audioQueue[0], this.crossfadeTime)
    }
  }

  Play(): void {
    this.playQueue().catch((err) => {
      console.error('Error playing soundtrack', err)
    })
  }

  Stop(): void {
    this._isActive = false

    this._audioQueue.forEach((a) => {
      if (a.audio.State === RpgAudioState.Playing) {
        a.audio.fade(0, this._fadeTime)
        setTimeout(() => {
          a.audio.stop()
        }, this._fadeTime)
      }
    })

    if (this._stopHandler) {
      this._stopHandler.handler(this._stopHandler.id, this)
    }

    this.timeouts.forEach((timeout) => clearTimeout(timeout))
  }

  ChangeVolume(volume: number): void {
    this._audioQueue[0].audio.setVolume(volume)
  }

  Fade(ratio: number, fadeTime?: number): void {
    this._audioQueue[0].audio.fade(ratio, fadeTime ?? this._fadeTime)
  }

  GetDuration(): Promise<number> {
    return this._audioQueue[0].audio.getDuration()
  }

  LoadedEffectID: `eff-${string}-${string}-${string}-${string}-${string}` | undefined

  Duration: number | undefined
}
