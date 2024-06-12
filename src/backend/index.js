const { app, screen, ipcMain } = require('electron')
const { createWindow } = require('./main')
const { getEmployees, getRoutes, getLastSaleID, setNewShift, setNewSaleWithShift, setSaleDetail, getInitiatedSaleById, getInitiatedSaleDetailById } = require('./controllers/nueva-venta')
const { getInitialSales } = require('./controllers/inicio')
const { getCompletedSales } = require('./controllers/ventas-finalizadas')
const { getSaleById, getSaleDetailById, updateSaleById, updateSaleDetailById } = require('./controllers/finalizar-venta')
const { getProducts } = require('./controllers/inventario')
const { existsProductWithCode, setNewProduct } = require('./controllers/registrar-producto')
const { getDirName } = require('../../ruta')

require('electron-reload')(getDirName())

app.whenReady().then( () => {
    ipcMain.handle('select:initialSales', async (event, criteria) => {
        return await getInitialSales(criteria)
    }),

    ipcMain.handle('select:completedSales', async (event, criteria) => {
        return await getCompletedSales(criteria)
    }),

    ipcMain.handle('select:employees', async () => {
        return await getEmployees()
    }),

    ipcMain.handle('select:routes', async () => {
        return await getRoutes()
    }),

    ipcMain.handle('select:lastSaleID', async () => {
        return await getLastSaleID()
    }),

    ipcMain.handle('select:products', async (event, searchCriteriaDeterminator) => {
        return await getProducts(searchCriteriaDeterminator)
    }),

    ipcMain.handle('select:saleByID', async (event, id) => {
        return await getSaleById(id)
    }),

    ipcMain.handle('select:saleDetailByID', async (event, id) => {
        return await getSaleDetailById(id)
    }),

    ipcMain.handle('select:initiatedSaleByID', async (event, id) => {
        return await getInitiatedSaleById(id)
    }),

    ipcMain.handle('select:initiatedSaleDetailByID', async (event, id) => {
        return await getInitiatedSaleDetailById(id)
    }),

    ipcMain.handle('insert:newShift', async (event, newShift) => {
        return await setNewShift(newShift)
    }),

    ipcMain.handle('insert:newSaleWithShift', async (event, newSaleWithShift) => {
        return await setNewSaleWithShift(newSaleWithShift)
    }),

    ipcMain.handle('insert:saleDetail', async (event, saleDetail) => {
        return await setSaleDetail(saleDetail)
    }),

    ipcMain.handle('insert:product', async (event, productData) => {
        return await setNewProduct(productData)
    })

    ipcMain.handle('update:sale', async (event, saleUpdated, id) => {
        return await updateSaleById(saleUpdated, id)
    }),

    ipcMain.handle('update:saleDetail', async (event, saleUpdated, saleId, productId) => {
        return await updateSaleDetailById(saleUpdated, saleId, productId)
    }),

    ipcMain.handle('exists:productWithCode', async (event, productCode) => {
        return await existsProductWithCode(productCode)
    })

    const primaryDisplay = screen.getPrimaryDisplay()
    const { width, height } = primaryDisplay.workAreaSize
    createWindow(width, height)
} );
