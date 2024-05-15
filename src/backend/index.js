const { app, screen, ipcMain } = require('electron')
const { createWindow, getEmployees, getRoutes, getLastSaleID, getProducts, setNewShift, setNewSaleWithShift, setSaleDetail } = require('./main')
const { getInitialSales } = require('./controllers/inicio')
const { getCompletedSales } = require('./controllers/ventas-finalizadas')
const { getSaleById } = require('./controllers/finalizar-venta')
const { getDirName } = require('../../ruta')

require('electron-reload')(getDirName())

app.whenReady().then( () => {
    ipcMain.handle('select:initialSales', async (event, criteria) => {
        return await getInitialSales(criteria)
    })

    ipcMain.handle('select:completedSales', async (event, criteria) => {
        return await getCompletedSales(criteria)
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

    ipcMain.handle('select:saleByID', async (event, id) => {
        return await getSaleById(id)
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
