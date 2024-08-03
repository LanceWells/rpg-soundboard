import { ElectronAPI } from '@electron-toolkit/preload'
import type { IAudioApi } from 'src/apis/audio/interface'

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
    audio: IAudioApi
  }
}
