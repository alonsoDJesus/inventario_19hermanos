const {app, screen, ipcMain} = require('electron')
const {createWindow, getInitialSales, getCompletedSales, getEmployees, getRoutes, getLastSaleID, getProducts, setNewShift, setNewSaleWithShift, setSaleDetail} = require('./main')
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

    ipcMain.handle('select:lastSaleID', async () => {
        return await getLastSaleID()
    })

    ipcMain.handle('select:products', async () => {
        return await getProducts()
    }),

    ipcMain.handle('insert:newShift', async (event, newShift) => {
        return await setNewShift(newShift)
    }),

    ipcMain.handle('insert:newSaleWithShift', async (event, newSaleWithShift) => {
        return await setNewSaleWithShift(newSaleWithShift)
    }),

    ipcMain.handle('insert:saleDetail', async (event, saleDetail) => {
        return await setSaleDetail(saleDetail)
    })

    const primaryDisplay = screen.getPrimaryDisplay()
    const { width, height } = primaryDisplay.workAreaSize
    createWindow(width, height)
} );
