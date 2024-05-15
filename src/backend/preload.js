const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
    navigateTo: (url) => {
        location.href = url
    },

    prepareSaleDetailOnSessionStorage: () => {
        const sessionStorageSales = sessionStorage.getItem("addedSales")
    
        if (sessionStorageSales) {
            // Recupera las ventas del session storage
            const auxAddedSales = JSON.parse(sessionStorageSales) // Prepara objeto
            
            // Prepara index
            let index = parseInt(sessionStorage.getItem("index"))
            index++
            sessionStorage.setItem("index", `${index}`)

            // Retorna los datos listos para insercion
            return {
                objectSales: auxAddedSales, 
                i: index
            }
        } else {
            const transientSale = new Object() // Prepara objeto
            sessionStorage.setItem("index", "1") // Prepara index

            // Retorna los datos listos para insercion
            return{
                objectSales: transientSale, 
                i: 1
            }
        }
    },

    setSaleDetailOnSessionStorage: (sales, addedSale, index) => {
        sales[index] = addedSale
        const salesString = JSON.stringify(sales)
        sessionStorage.setItem("addedSales", salesString) 
    },
    
    selectInitialSales: (criteria) => {
        return ipcRenderer.invoke('select:initialSales', criteria) 
    },

    selectCompletedSales: (criteria) => {
        return ipcRenderer.invoke('select:completedSales', criteria) 
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