import { app, shell, BrowserWindow, ipcMain, protocol, net, session } from 'electron'
import { join } from 'path'
import path from 'node:path'
import os from 'node:os'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { AudProtocolPrefix } from '../apis/audProtocol/aud'
import url from 'url'
import { GetAppDataPath } from '../utils/paths'
import { Extensions } from 'electron'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

protocol.registerSchemesAsPrivileged([
  { scheme: 'aud', privileges: { stream: true, supportFetchAPI: true, bypassCSP: true } }
])

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  // installExtension(REACT_DEVELOPER_TOOLS)
  //   .then((ext) => console.log(`Added extension ${ext.name}`))
  //   .catch((err) => `Error loading extension: ${err}`)
  // Electron.Extensions
  // Extensions.loadExtension()
  // C:\Users\lance\AppData\Local\Google\Chrome\User Data\Default\Extensions\fmkadmapgofadopljbjfkapdkoienihi
  // C:\Users\lance\%LOCALAPPDATA%\Google\Chrome\User Data\Default\Extensions\fmkadmapgofadopljbjfkapdkoienihi\6.1.2_0

  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Add a protocol to access local files on the host machine.
  protocol.handle('aud', (request) => {
    const filePath = request.url.slice(`${AudProtocolPrefix}://`.length)
    const configFilePath = GetAppDataPath()
    const pathWithDir = join(configFilePath, filePath)
    const pathToFileUrl = url.pathToFileURL(pathWithDir)

    return net.fetch(pathToFileUrl.toString())
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  const reactDevToolsPath = path.join(
    os.homedir(),
    `AppData\\Local\\Google\\Chrome\\User Data\\Default\\Extensions\\fmkadmapgofadopljbjfkapdkoienihi\\7.0.0_0`
  )

  const ext = await session.defaultSession.extensions.loadExtension(reactDevToolsPath)
  console.log(ext.id)

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
