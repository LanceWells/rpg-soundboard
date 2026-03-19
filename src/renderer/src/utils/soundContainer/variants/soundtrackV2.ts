import { SoundVariants } from 'src/apis/audio/types/soundVariants'
import {
  Handler,
  ISoundContainer,
  ISoundtrackContainer,
  RpgAudioContainer,
  SoundContainerSetup,
  SoundtrackEvents
} from '../interface'
import { Ctx, ListenerType, RpgAudio, RpgAudioState } from '@renderer/rpgAudioEngine'
import { getRandomInt } from '@renderer/utils/random'
import { SoundEffectWithPlayerDetails } from 'src/apis/audio/types/groups'
import { produce } from 'immer'
import { VolumeManager } from '../volumeManager'

export class SoundtrackSoundContainerV2 implements ISoundContainer, ISoundtrackContainer {
  public Variant: SoundVariants = 'Soundtrack'

  private readonly crossfadeTime: number = 12500
  private _fadeTime: number = 2500
  private _isActive: boolean = true

  private _audioQueue: RpgAudioContainer[]
  private ctx: Ctx
  private _loadedHandler: Handler<string> | undefined
  private _stopHandler: Handler<string> | undefined
  private _nextHandlers: Handler<string, ISoundContainer & ISoundtrackContainer>[] = []

  private _effects: SoundEffectWithPlayerDetails[]
  private _effectsPointer: number = 0
  private _containerVolume: number = 100
  private _volumeManager: VolumeManager = new VolumeManager(0.35)

  private timeouts: Set<NodeJS.Timeout> = new Set()

  get Volume() {
    return this._containerVolume
  }

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

  public on(
    event: SoundtrackEvents,
    handler: Handler<string, ISoundContainer & ISoundtrackContainer>
  ) {
    switch (event) {
      case 'playNext': {
        this._nextHandlers.push(handler)
      }
    }
  }

  private createAudio(effect: SoundEffectWithPlayerDetails): RpgAudioContainer {
    return {
      name: effect.name,
      targetVolume: effect.volume,
      audio: new RpgAudio({
        ctx: this.ctx,
        isLargeFile: effect.useHtml5,
        loop: false,
        path: effect.path,
        volume: 0,
        format: effect.format
      })
    }
  }

  private async playSong(
    container: RpgAudioContainer,
    fadeInTime: number,
    fadeOutTime: {
      inMs: number
      overMs: number
    } | null
  ) {
    return new Promise<void>(async (res) => {
      this._nextHandlers.forEach((h) => h.handler(h.id, this))

      container.audio.on(ListenerType.Stop, () => {
        if (fadeOutTime === null) {
          this._audioQueue.shift()
        }
        res()
      })

      if (fadeOutTime !== null) {
        const fadeTimeout = setTimeout(
          (() => {
            this.timeouts.delete(fadeTimeout)
            if (container.audio.State !== RpgAudioState.Playing) {
              return
            }

            container.audio.fade(0, fadeOutTime.overMs)

            const endFadeTimeout = setTimeout(
              (() => {
                this.timeouts.delete(endFadeTimeout)
                container.audio.stop()
              }).bind(this),
              fadeOutTime.overMs
            )

            this.timeouts.add(endFadeTimeout)

            // We can play the next song now, so go ahead and fulfill this promise.
            this._audioQueue.shift()
            res()
          }).bind(this),
          fadeOutTime.inMs
        )
        this.timeouts.add(fadeTimeout)
      }

      container.audio.play()
      const actualVolume = this._volumeManager.getVolume(
        container.targetVolume,
        this._containerVolume
      )

      if (fadeInTime > 0) {
        container.audio.fade(actualVolume, fadeInTime)
      } else {
        container.audio.setVolume(actualVolume)
      }
    })
  }

  private async playQueue() {
    const firstSong = this._audioQueue[0]
    const duration = await firstSong.audio.getDuration()
    const fadeDetails =
      Number.isFinite(duration) && duration > 0
        ? {
            inMs: duration - Math.min(duration / 10, this.crossfadeTime),
            overMs: Math.min(duration / 10, this.crossfadeTime)
          }
        : null

    await this.playSong(this._audioQueue[0], this._fadeTime, fadeDetails)

    while (this._isActive) {
      await this.playNextSongInternal()
    }
  }

  public async playNextSong() {
    this.stopInternal()
    this._audioQueue.shift()
  }

  private async playNextSongInternal() {
    const nextEffect = this.getNextEffect()
    const nextSong = this.createAudio(nextEffect)
    const duration = await nextSong.audio.getDuration()
    const fadeDetails =
      Number.isFinite(duration) && duration > 0
        ? {
            inMs: duration - Math.min(duration / 10, this.crossfadeTime),
            overMs: Math.min(duration / 10, this.crossfadeTime)
          }
        : null

    this._audioQueue.push(nextSong)
    await this.playSong(this._audioQueue[0], this.crossfadeTime, fadeDetails)
  }

  public getActiveSong(): RpgAudioContainer | undefined {
    return this._audioQueue[0]
  }

  Play(): void {
    this.playQueue().catch((err) => {
      console.error('Error playing soundtrack', err)
    })
  }

  Stop(): void {
    this._isActive = false
    this.stopInternal()
    if (this._stopHandler) {
      this._stopHandler.handler(this._stopHandler.id, this)
    }
  }

  private stopInternal(): void {
    this._audioQueue.forEach((a) => {
      if (a.audio.State === RpgAudioState.Playing) {
        a.audio.fade(0, this._fadeTime)
        setTimeout(() => {
          a.audio.stop()
        }, this._fadeTime)
      }
    })

    this.timeouts.forEach((timeout) => clearTimeout(timeout))
  }

  ChangeVolume(volume: number): void {
    this._containerVolume = volume

    const activeSong = this.getActiveSong()
    if (activeSong === undefined) {
      return
    }

    const actualVolume = this._volumeManager.getVolume(
      activeSong.targetVolume,
      this._containerVolume
    )

    activeSong.audio.setVolume(actualVolume)
  }

  Fade(ratio: number, fadeTime?: number): void {
    const activeSong = this.getActiveSong()
    if (activeSong === undefined) {
      return
    }

    const newVolume =
      this._volumeManager.getVolume(activeSong.targetVolume, this._containerVolume) * ratio

    activeSong.audio.fade(newVolume, fadeTime ?? this._fadeTime)
  }

  GetDuration(): Promise<number> {
    return this._audioQueue[0].audio.getDuration()
  }

  LoadedEffectID: `eff-${string}-${string}-${string}-${string}-${string}` | undefined

  Duration: number | undefined
}
