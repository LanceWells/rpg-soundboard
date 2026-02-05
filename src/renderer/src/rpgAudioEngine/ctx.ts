import { RpgAudioConvolverNode } from './node/convolver'
import caveImpulse from '../assets/impulseResponses/echothief_moonsmugglers.wav'
import glacierImpulse from '../assets/impulseResponses/echothief_byronglacier.wav'
import punchbowlImpulse from '../assets/impulseResponses/echothief_devilpunchbowl.wav'
import casaImpulse from '../assets/impulseResponses/echothief_casagrande.wav'
import greekImpulse from '../assets/impulseResponses/echothief_greektheater.wav'
import patio from '../assets/impulseResponses/echothief_supercomppatio.wav'
import batcave from '../assets/impulseResponses/echothief_batcave.wav'
import deathvalley from '../assets/impulseResponses/echothief_deathvalley.wav'

class AudioProcessingNodes {
  public readonly cave: RpgAudioConvolverNode

  constructor(ctx: AudioContext) {
    this.cave = new RpgAudioConvolverNode(ctx, casaImpulse)
    this.cave.getNode().connect(ctx.destination)
  }
}

export const AudioCtx = new AudioContext()

export const AudioProcessing = new AudioProcessingNodes(AudioCtx)
