import { SoundVariants } from 'src/apis/audio/types/soundVariants'
import {
  GetSoundsResponse,
  GroupID,
  SoundEffectWithPlayerDetails
} from 'src/apis/audio/types/groups'
import { Handler, ISoundContainer } from '../interface'
import { NewSoundContainer } from '../util'
import { SequenceElementID, SoundGroupSequenceElement } from 'src/apis/audio/types/items'

export type Delay = {
  type: 'delay'
  id: SequenceElementID
  delayInMs: number
}

export type Group = {
  type: 'group'
  groupID: GroupID
  id: SequenceElementID
  effects: SoundEffectWithPlayerDetails[]
  variant: SoundVariants
}

export type EffectGroup = Delay | Group

export type SequenceSpecificSetup = {
  effectGroups: EffectGroup[]
  elementPlayingHandler?: (sequence: SequenceElementID, container: ISoundContainer) => void
  elementStoppedHandler?: (sequence: SequenceElementID, container: ISoundContainer) => void
  stoppedHandler?: Handler<string>
}

type EffectTiming = {
  effect: SequenceElementID
  delay: number
}

type ContainerWithSequenceID = {
  container: ISoundContainer
  id: SequenceElementID
}

export class SequenceSoundContainer implements ISoundContainer {
  Variant: SoundVariants = 'Sequence'
  LoadedEffectID: `eff-${string}-${string}-${string}-${string}-${string}` | undefined = undefined

  private containers: Map<SequenceElementID, ISoundContainer>
  private setup: SequenceSpecificSetup
  private effectTiming: EffectTiming[] = []
  private totalRuntime: number = 0
  private activeTimeouts: NodeJS.Timeout[] = []

  private elementPlayingHandler:
    | ((sequence: SequenceElementID, container: ISoundContainer) => void)
    | undefined

  private elementStoppedHandler:
    | ((sequence: SequenceElementID, container: ISoundContainer) => void)
    | undefined

  private stoppedHandler: Handler<string> | undefined

  durationMap: Map<string, number> = new Map()

  constructor(setup: SequenceSpecificSetup) {
    this.setup = setup
    this.containers = new Map()
    this.elementPlayingHandler = setup.elementPlayingHandler
    this.elementStoppedHandler = setup.elementStoppedHandler
    this.stoppedHandler = setup.stoppedHandler
  }

  async GetDuration(): Promise<number> {
    return [...this.durationMap.values()].reduce((acc, curr) => curr + acc, 0)
  }

  async Init() {
    const containerPromises = this.setup.effectGroups
      .filter((g) => g.type === 'group')
      .map((e) =>
        Promise.race([
          new Promise<ContainerWithSequenceID>(async (res, rej) => {
            // const isLoaded = async (gid: string, container: ISoundContainer) => {
            //   const duration = await container.GetDuration()

            //   if (!Number.isFinite(duration)) {
            //     rej(`Got an infinite duration for effect with group ID ${container.LoadedEffectID}`)
            //   }

            //   this.durationMap.set(gid, duration ?? 0)
            //   res({
            //     container,
            //     id: gid as SequenceElementID
            //   })
            // }

            const isStopped = (gid: string, container: ISoundContainer) => {
              if (this.elementStoppedHandler) {
                this.elementStoppedHandler(gid as SequenceElementID, container)
              }
            }

            const container = NewSoundContainer(e.variant, undefined, {
              effects: e.effects,
              // loadedHandler: {
              //   id: e.id,
              //   handler: isLoaded
              // },
              stopHandler: {
                id: e.id,
                handler: isStopped
              }
            })

            const duration = await container.GetDuration()
            this.durationMap.set(e.id, duration)
            res({ container, id: e.id as SequenceElementID })
          }),
          new Promise<ContainerWithSequenceID>((_res, rej) =>
            setTimeout(() => rej(`Could not load ${e.groupID} in time`), 1500000)
          )
        ])
      )

    const containers = await Promise.all(containerPromises)
    this.containers = new Map(containers.map((c) => [c.id, c.container]))

    const timing = this.setup.effectGroups.reduce(
      (acc, curr) => {
        if (curr.type === 'delay') {
          acc.runningTimer += curr.delayInMs
          return acc
        }

        const thisContainerDuration = this.durationMap.get(curr.id)
        if (thisContainerDuration) {
          acc.effects.push({
            delay: acc.runningTimer,
            effect: curr.id
          })
          acc.runningTimer += thisContainerDuration
        }

        return acc
      },
      {
        runningTimer: 0,
        effects: []
      } as {
        runningTimer: number
        effects: EffectTiming[]
      }
    )

    this.totalRuntime = timing.runningTimer
    this.effectTiming = timing.effects

    return this
  }

  Duration: number | undefined

  Play(): void {
    const effects = this.effectTiming.map(async (e) => {
      const effect = this.containers.get(e.effect)

      if (effect === undefined) {
        console.error(`Could not get sequence effect with id ${e.effect}`)
        return
      }

      await new Promise((res) => {
        const t = setTimeout(res, e.delay)
        this.activeTimeouts.push(t)
      })

      if (this.elementPlayingHandler) {
        this.elementPlayingHandler(e.effect, effect)
      }

      effect.Play()
      return
    })

    const runtimeElapsedPromise = new Promise<void>((res) => setTimeout(res, this.totalRuntime))

    const playSequenceSounds = async (effects: Promise<void>[]) => {
      await Promise.all(effects)
      ;(this as SequenceSoundContainer).HandleStopped()
    }

    playSequenceSounds.bind(this)([...effects, runtimeElapsedPromise])
  }

  Stop(): void {
    this.containers.forEach((c) => c.Stop())
    this.HandleStopped()
  }

  ChangeVolume(volume: number): void {
    this.containers.forEach((c) => c.ChangeVolume(volume))
  }

  Fade(ratio: number): void {
    this.containers.forEach((c) => c.Fade(ratio))
  }

  private HandleStopped() {
    this.activeTimeouts.forEach((t) => clearTimeout(t))
    if (this.stoppedHandler) {
      this.stoppedHandler.handler(this.stoppedHandler.id, this)
    }
  }

  static ApiToSetupElements(
    elements: SoundGroupSequenceElement[],
    getSounds: (groupID: GroupID) => Promise<GetSoundsResponse>
  ) {
    return elements.map<Promise<EffectGroup>>(async (e) => {
      if (e.type === 'delay') {
        return {
          type: 'delay',
          delayInMs: e.msToDelay,
          id: e.id
        }
      }

      const s = await getSounds(e.groupID)

      return {
        type: 'group',
        effects: s.sounds,
        groupID: e.groupID,
        id: e.id,
        variant: s.variant
      }
    })
  }
}
