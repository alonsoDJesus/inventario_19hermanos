const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
    selectInitialSales: () => {
        return ipcRenderer.invoke('select:initialSales') 
    },

    selectCompletedSales: () => {
        return ipcRenderer.invoke('select:completedSales') 
    },

    selectEmployees: () => {
        return ipcRenderer.invoke('select:employees') 
    },

    selectRoutes: () => {
        return ipcRenderer.invoke('select:routes') 
    },

    selectLastSaleID: () => {
        return ipcRenderer.invoke('select:lastSaleID') 
    },

    selectProducts: () => {
        return ipcRenderer.invoke('select:products') 
    },

    insertNewShift: (newShift) => {
        return ipcRenderer.invoke('insert:newShift', newShift) 
    },

    insertNewSaleWithShift: (newSaleWithShift) => {
        return ipcRenderer.invoke('insert:newSaleWithShift', newSaleWithShift) 
    },

    insertSaleDetail: (saleDetail) => {
        return ipcRenderer.invoke('insert:saleDetail', saleDetail) 
    },
})