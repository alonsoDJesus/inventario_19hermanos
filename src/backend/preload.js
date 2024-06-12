const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
    navigateTo: (url, id = -1, visitMode = 'none') => {
        if (url.includes('finalizar-venta.html')) {
            const completingSaleParams = {
                editingStatusOfCompletingSale: true,
                index: id
            }

            const completingSaleParamsString = JSON.stringify(completingSaleParams)
            sessionStorage.setItem("completingSaleParams", completingSaleParamsString)

        } else {
            if (url.includes('nueva-venta.html')) {
                let newSaleParams
                if (id == -1) {
                    newSaleParams = {
                        statusOfNewSale: 'create',
                    }
                } else{
                    if (visitMode == 'edit') {
                        newSaleParams = {
                           statusOfNewSale: visitMode,
                           saleId: id
                        }
                    }
                }

                const newSaleParamsString = JSON.stringify(newSaleParams)
                sessionStorage.setItem("newSaleParams", newSaleParamsString)
            } else{
                if (url.includes('registrar-producto.html')){
                    const newProductParams = {
                        visualizationStatus: visitMode
                    }

                    const newProductParamsString = JSON.stringify(newProductParams)
                    sessionStorage.setItem("newProductParams", newProductParamsString)
                }
            } 
        }   

        location.href = url
    },

    getFromSessionStorage: (paramID) => {
        let params = sessionStorage.getItem(paramID)
        params = JSON.parse(params)
        return params
    },

    deleteParams: (paramID) => {
        sessionStorage.removeItem(paramID)
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
        console.log(sales)
        sales[index] = addedSale
        const salesString = JSON.stringify(sales)
        sessionStorage.setItem("addedSales", salesString) 
    },

    testByRegexp: (value, valueType) => {
        const expressions = {
            codeProduct: /^[A-ZÁ-Úa-zá-ú0-9_ ]{1,10}$/,
            nameProduct: /^([A-ZÁ-Úa-zá-ú0-9]+[\.\, ]*)+$/,
            numbers: /^[0-9]+(\.[0-9]+)?$/,
            intNumbers: /^[0-9]+$/
        }
        
        return expressions[valueType].test(value)
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

    selectProducts: (searchCriteriaDeterminator) => {
        return ipcRenderer.invoke('select:products', searchCriteriaDeterminator) 
    },

    selectSaleById: (id) => {
        return ipcRenderer.invoke('select:saleByID', id) 
    },

    selectSaleDetailById: (id) => {
        return ipcRenderer.invoke('select:saleDetailByID', id) 
    },

    selectInitiatedSaleById: (id) => {
        return ipcRenderer.invoke('select:initiatedSaleByID', id) 
    },

    selectInitiatedSaleDetailById: (id) => {
        return ipcRenderer.invoke('select:initiatedSaleDetailByID', id) 
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

    insertNewProduct: (productData) => {
        return ipcRenderer.invoke('insert:product', productData) 
    },

    updateSale: (saleUpdated, id) => {
        return ipcRenderer.invoke('update:sale', saleUpdated, id) 
    },

    updateSaleDetail: (saleUpdated, saleId, productId) => {
        return ipcRenderer.invoke('update:saleDetail', saleUpdated, saleId, productId) 
    },

    existsProductWithCode: (productCode) => {
        return ipcRenderer.invoke('exists:productWithCode', productCode) 
    }
})