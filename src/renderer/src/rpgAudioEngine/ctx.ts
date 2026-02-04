import { RpgAudioConvolverNode } from './node/convolver'
import caveImpulse from '../assets/impulseResponses/echothief_moonsmugglers.wav'
import glacierImpulse from '../assets/impulseResponses/echothief_byronglacier.wav'
import punchbowlImpulse from '../assets/impulseResponses/echothief_devilpunchbowl.wav'
import casaImpulse from '../assets/impulseResponses/echothief_casagrande.wav'

class AudioProcessingNodes {
  public readonly cave: RpgAudioConvolverNode

  constructor(ctx: AudioContext) {
    this.cave = new RpgAudioConvolverNode(ctx, casaImpulse)
    this.cave.getNode().connect(ctx.destination)
  }
}

export const AudioCtx = new AudioContext()

export const AudioProcessing = new AudioProcessingNodes(AudioCtx)
