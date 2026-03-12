export class VolumeManager {
  constructor(private volumeModifier: number) {}

  getVolume(effectVolume: number, containerVolume: number): number {
    // Generally only used by soundtracks using the playback module. If the user has specified that
    // they want to modify the volume, we use "100" as the baseline value.
    const containerModifier = containerVolume / 100

    return containerModifier * effectVolume * this.volumeModifier
  }
}
