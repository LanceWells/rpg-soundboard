class AudioContextSelector {
  public environmentalCtx: AudioContext
  public soundtrackCtx: AudioContext
  public effectlessCtx: AudioContext

  constructor() {
    this.environmentalCtx = new AudioContext()
    this.soundtrackCtx = new AudioContext()
    this.effectlessCtx = new AudioContext()
  }
}

export const AudioCtx = new AudioContextSelector()
