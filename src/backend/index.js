const {app, screen, ipcMain} = require('electron')
const {createWindow, getInitialSales} = require('./main')
const { getDirName } = require('../../ruta')

require('electron-reload')(getDirName())

app.whenReady().then( () => {
    ipcMain.handle('select:initialSales', async () => {
        return await getInitialSales()
    })

    const primaryDisplay = screen.getPrimaryDisplay()
    const { width, height } = primaryDisplay.workAreaSize
    createWindow(width, height)
} );
