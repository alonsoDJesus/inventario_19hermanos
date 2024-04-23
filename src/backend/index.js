const {app, screen, ipcMain} = require('electron')
const {createWindow, getInitialSales, getCompletedSales, getEmployees, getRoutes} = require('./main')
const { getDirName } = require('../../ruta')

require('electron-reload')(getDirName())

app.whenReady().then( () => {
    ipcMain.handle('select:initialSales', async () => {
        return await getInitialSales()
    })

    ipcMain.handle('select:completedSales', async () => {
        return await getCompletedSales()
    })

    ipcMain.handle('select:employees', async () => {
        return await getEmployees()
    })

    ipcMain.handle('select:routes', async () => {
        return await getRoutes()
    })

    const primaryDisplay = screen.getPrimaryDisplay()
    const { width, height } = primaryDisplay.workAreaSize
    createWindow(width, height)
} );
