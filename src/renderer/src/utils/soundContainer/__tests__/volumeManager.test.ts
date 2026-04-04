import { describe, it, expect } from 'vitest'
import { VolumeManager } from '../volumeManager'

describe('VolumeManager', () => {
  describe('getVolume', () => {
    it('returns the correct combined volume at 100% container volume', () => {
      const vm = new VolumeManager(1)
      // containerModifier = 100/100 = 1, effectVolume = 80, modifier = 1
      expect(vm.getVolume(80, 100)).toBe(80)
    })

    it('scales down at 50% container volume', () => {
      const vm = new VolumeManager(1)
      // containerModifier = 50/100 = 0.5, effectVolume = 80
      expect(vm.getVolume(80, 50)).toBe(40)
    })

    it('applies the volumeModifier', () => {
      const vm = new VolumeManager(0.25)
      // containerModifier = 1, effectVolume = 100, modifier = 0.25
      expect(vm.getVolume(100, 100)).toBe(25)
    })

    it('returns 0 when container volume is 0', () => {
      const vm = new VolumeManager(1)
      expect(vm.getVolume(100, 0)).toBe(0)
    })

    it('returns 0 when effect volume is 0', () => {
      const vm = new VolumeManager(1)
      expect(vm.getVolume(0, 100)).toBe(0)
    })

    it('returns 0 when volumeModifier is 0', () => {
      const vm = new VolumeManager(0)
      expect(vm.getVolume(100, 100)).toBe(0)
    })

    it('uses 0.25 volumeModifier for the standard soundtrack case', () => {
      // The real VolumeManager is constructed with 0.25 in SoundtrackSoundContainerV2
      const vm = new VolumeManager(0.25)
      // effectVolume = 100, containerVolume = 100
      // result = (100/100) * 100 * 0.25 = 25
      expect(vm.getVolume(100, 100)).toBe(25)
    })

    it('scales proportionally above 100% container volume', () => {
      const vm = new VolumeManager(1)
      // containerModifier = 200/100 = 2, effectVolume = 50
      expect(vm.getVolume(50, 200)).toBe(100)
    })
  })
})
