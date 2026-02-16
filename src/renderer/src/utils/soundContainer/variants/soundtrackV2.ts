import { SoundVariants } from 'src/apis/audio/types/soundVariants'
import { Handler, ISoundContainer, SoundContainerSetup } from '../interface'
import { Ctx, ListenerType, RpgAudio, RpgAudioState } from '@renderer/rpgAudioEngine'
import { getRandomInt } from '@renderer/utils/random'
import { SoundEffectWithPlayerDetails } from 'src/apis/audio/types/groups'
import { produce } from 'immer'

type RpgAudioContainer = {
  targetVolume: number
  audio: RpgAudio
}

export class SoundtrackSoundContainerV2 implements ISoundContainer {
  public Variant: SoundVariants = 'Soundtrack'

  private readonly crossfadeTime: number = 12500
  private _fadeTime: number = 2500
  private _isActive: boolean = true

  private _audioQueue: [RpgAudioContainer, ...RpgAudioContainer[]]
  private ctx: Ctx
  private _loadedHandler: Handler<string> | undefined
  private _stopHandler: Handler<string> | undefined

  private _effects: SoundEffectWithPlayerDetails[]
  private _effectsPointer: number = 0

  private timeouts: Set<NodeJS.Timeout> = new Set()

  private shuffleEffects() {
    // This elipses is actually pretty important. It turns out that the array returned by the
    // produce function is considered "immutable", and the splice operation is effectively calling
    // a delete operation on the 'n' property of an array. This elipses actually avoids that problem
    // by reconstructing the array, but keeping the objects.
    const effectsCopy = [...produce(this._effects, (draft) => draft)]
    const newEffects: SoundEffectWithPlayerDetails[] = []

    while (effectsCopy.length > 0) {
      const randomInt = getRandomInt(0, effectsCopy.length - 1)
      const effect = effectsCopy.splice(randomInt, 1)
      newEffects.push(...effect)
    }

    this._effects = newEffects
  }

  private getNextEffect(): SoundEffectWithPlayerDetails {
    if (this._effectsPointer === this._effects.length) {
      this.shuffleEffects()
      this._effectsPointer = 0
    }

    return this._effects[this._effectsPointer++]
  }

  constructor(setup: SoundContainerSetup, _enableLoops: boolean = true) {
    const { effects, stopHandler, loadedHandler } = setup

    this._effects = effects
    this._loadedHandler = loadedHandler
    this._stopHandler = stopHandler
    this.ctx = Ctx.Effectless

    this.shuffleEffects()
    const initialAudio = this.createAudio(this.getNextEffect())

    initialAudio.audio.on(
      ListenerType.Load,
      (() => {
        if (this._loadedHandler) {
          this._loadedHandler.handler(this._loadedHandler.id, this)
        }
      }).bind(this)
    )

    this._audioQueue = [initialAudio]
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
      const nextEffect = this.getNextEffect()
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
