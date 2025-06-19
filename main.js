const path = require("path")
const { app, BrowserWindow, ipcMain } = require("electron")
const remoteMain = require("@electron/remote/main")

remoteMain.initialize()

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
      webviewTag: true,
      sandbox: false
    }
  })

  remoteMain.enable(mainWindow.webContents)
  mainWindow.loadFile("index.html")
}

app.whenReady().then(createWindow)

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit()
})

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

ipcMain.on("minimize-window", () => {
  mainWindow.minimize()
})

ipcMain.on("maximize-window", () => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow.maximize()
  }
})

ipcMain.on("close-window", () => {
  mainWindow.close()
})
