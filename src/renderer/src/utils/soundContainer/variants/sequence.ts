import { SoundVariants } from 'src/apis/audio/types/soundVariants'
import { GroupID, SoundEffectWithPlayerDetails } from 'src/apis/audio/types/groups'
import { ISoundContainer, SoundContainerSetup } from '../interface'
import { NewSoundContainer } from '../util'
import { SequenceElementID } from 'src/apis/audio/types/items'

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
}

export type EffectGroup = Delay | Group

export type SequenceSpecificSetup = {
  effectGroups: EffectGroup[]
  playingHandler?: (sequence: SequenceElementID, container: ISoundContainer) => void
  stoppedHandler?: (sequence: SequenceElementID, container: ISoundContainer) => void
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

  // private containers: ISoundContainer[] = []
  private containers: Map<SequenceElementID, ISoundContainer>
  private setup: SequenceSpecificSetup
  private effectTiming: EffectTiming[] = []
  private playingHandler:
    | ((sequence: SequenceElementID, container: ISoundContainer) => void)
    | undefined

  private stoppedHandler:
    | ((sequence: SequenceElementID, container: ISoundContainer) => void)
    | undefined

  durationMap: Map<string, number> = new Map()

  constructor(setup: SequenceSpecificSetup) {
    this.setup = setup
    this.containers = new Map()
    this.playingHandler = setup.playingHandler
    this.stoppedHandler = setup.stoppedHandler
  }

  async Init() {
    const containerPromises = this.setup.effectGroups
      .filter((g) => g.type === 'group')
      .map((e) =>
        Promise.race([
          new Promise<ContainerWithSequenceID>((res) => {
            const isLoaded = (gid: string, container: ISoundContainer) => {
              this.durationMap.set(gid, container.Duration ?? 0)
              res({
                container,
                id: gid as SequenceElementID
              })
            }

            const isStopped = (gid: string, container: ISoundContainer) => {
              if (this.stoppedHandler) {
                this.stoppedHandler(gid as SequenceElementID, container)
              }
            }

            const container = NewSoundContainer('Default', undefined, {
              effects: e.effects,
              loadedHandler: {
                id: e.id,
                handler: isLoaded
              },
              stopHandler: {
                id: e.id,
                handler: isStopped
              }
            })

            if (container.Duration !== undefined) {
              this.durationMap.set(e.id, container.Duration ?? 0)
              res({
                container: container,
                id: e.id
              })
            }
          }),
          new Promise<ContainerWithSequenceID>((_res, rej) =>
            setTimeout(() => rej(`Could not load ${e.groupID} in time`), 15000)
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

    this.effectTiming = timing.effects
  }

  Duration: number | undefined

  Play(): void {
    const effects = this.effectTiming.map(async (e) => {
      const effect = this.containers.get(e.effect)

      if (effect === undefined) {
        console.error(`Could not get sequence effect with id ${e.effect}`)
        return
      }

      await new Promise((res) => setTimeout(res, e.delay))

      if (this.playingHandler) {
        this.playingHandler(e.effect, effect)
      }

      effect.Play()
      return
    })

    async function playSequenceSounds() {
      await Promise.all(effects)
    }

    playSequenceSounds()
  }

  Stop(): void {
    throw new Error('Method not implemented.')
  }

  ChangeVolume(volume: number): void {
    // no-op
  }

  Fade(ratio: number): void {
    // no-op
  }
}
