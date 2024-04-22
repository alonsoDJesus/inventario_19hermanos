const {app, screen, ipcMain} = require('electron')
const {createWindow, getInitialSales, getCompletedSales} = require('./main')
const { getDirName } = require('../../ruta')

require('electron-reload')(getDirName())

app.whenReady().then( () => {
    ipcMain.handle('select:initialSales', async () => {
        return await getInitialSales()
    })

    ipcMain.handle('select:completedSales', async () => {
        return await getCompletedSales()
    })

    const primaryDisplay = screen.getPrimaryDisplay()
    const { width, height } = primaryDisplay.workAreaSize
    createWindow(width, height)
} );
