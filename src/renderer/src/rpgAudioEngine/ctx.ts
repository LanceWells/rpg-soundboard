import { RpgAudioConvolverNode } from './node/convolver'
import caveImpulse from '../assets/impulseResponses/echothief_moonsmugglers.wav'
import glacierImpulse from '../assets/impulseResponses/echothief_byronglacier.wav'
import punchbowlImpulse from '../assets/impulseResponses/echothief_devilpunchbowl.wav'
import casaImpulse from '../assets/impulseResponses/echothief_casagrande.wav'
import greekImpulse from '../assets/impulseResponses/echothief_greektheater.wav'
import patio from '../assets/impulseResponses/echothief_supercomppatio.wav'
import batcave from '../assets/impulseResponses/echothief_batcave.wav'
import deathvalley from '../assets/impulseResponses/echothief_deathvalley.wav'
import { RandomReverbNode } from './node/randomReverb'

class AudioProcessingNodes {
  public readonly cave: RpgAudioConvolverNode
  public readonly caveRandom: RandomReverbNode

  constructor(ctx: AudioContext) {
    this.cave = new RpgAudioConvolverNode(ctx, casaImpulse)
    this.cave.getNode().connect(ctx.destination)

    this.caveRandom = new RandomReverbNode({
      nodes: [
        new RpgAudioConvolverNode(ctx, caveImpulse),
        new RpgAudioConvolverNode(ctx, punchbowlImpulse),
        new RpgAudioConvolverNode(ctx, greekImpulse),
        new RpgAudioConvolverNode(ctx, patio),
        new RpgAudioConvolverNode(ctx, batcave)
      ]
    })
    this.caveRandom.connect(ctx.destination)
  }
}

export const AudioCtx = new AudioContext()

export const AudioProcessing = new AudioProcessingNodes(AudioCtx)
