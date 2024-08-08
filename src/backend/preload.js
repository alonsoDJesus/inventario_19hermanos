const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
    navigateTo: (url, id = -1, visitMode = 'none') => {
        if (url.includes('finalizar-venta.html')) {
            const completingSaleParams = {
                firstEdition: visitMode == 'firstEdition',
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
                    let newProductParams = {
                        visualizationStatus: visitMode
                    }

                    id != -1 ? newProductParams.productCode = id : ''

                    const newProductParamsString = JSON.stringify(newProductParams)
                    sessionStorage.setItem("newProductParams", newProductParamsString)
                } else {
                    if (url.includes('modificar-stock.html')) {
                        const productParams = {
                            productCode: id
                        }

                        const productParamsString = JSON.stringify(productParams)
                        sessionStorage.setItem("productParams", productParamsString)
                    }
                }
            } 
        }   

        location.href = url
    },

    getFromSessionStorage: (identifier) => {
        let params = sessionStorage.getItem(identifier)
        return params != null ? JSON.parse(params) : params
    },

    deleteParams: (identifier) => {
        sessionStorage.removeItem(identifier)
    },

    prepareSessionStorage: (keyIndex, sessionStorageSales) => {

        if (sessionStorageSales) {
            // Recupera las ventas del session storage
            //const auxAddedSales = JSON.parse(sessionStorageSales) // Prepara objeto
            
            // Prepara index
            let index = parseInt(sessionStorage.getItem(keyIndex))
            index++
            sessionStorage.setItem(keyIndex, `${index}`)

            // Retorna los datos listos para insercion
            return {
                objectSales: sessionStorageSales, 
                i: index
            }
        } else {
            const transientSale = new Object() // Prepara objeto
            sessionStorage.setItem(keyIndex, "1") // Prepara index

            // Retorna los datos listos para insercion
            return{
                objectSales: transientSale, 
                i: 1
            }
        }
    },

    setItemsOnSessionStorage: (key, sales) => {
        const salesString = JSON.stringify(sales)
        sessionStorage.setItem(key, salesString) 
    },

    repareIndex: (index) => {
        sessionStorage.setItem("addedSalesIndex", `${index}`)
    },

    testByRegexp: (value, valueType) => {
        const expressions = {
            codeProduct: /^[A-ZÁ-Úa-zá-ú0-9_ ]{1,10}$/,
            nameProduct: /^([A-ZÁ-Úa-zá-ú0-9\/]+[\.\, ]*)+$/,
            numbers: /^[0-9]+(\.[0-9]+)?$/,
            intNumbers: /^[0-9]+$/,
            positiveNegativeIntNumbers: /^\-?[0-9]+$/,
            prices: /^\$? ?[0-9]+(\.[0-9]+)?$/
        }
        
        return expressions[valueType].test(value)
    },

    roundToTwo: (num) => {
        return +(Math.round(num + 'e+2') + 'e-2');
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

    selectProducts: (searchCriteriaDeterminator, typeCriteria = 'byCode') => {
        return ipcRenderer.invoke('select:products', searchCriteriaDeterminator, typeCriteria) 
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

    selectAvailableStocks: (saleId) => {
        return ipcRenderer.invoke('select:availableStocks', saleId) 
    },

    selectProductsNamesSuggestions: (productName) => {
        return ipcRenderer.invoke('select:productsNamesSuggestions', productName) 
    },

    updateSale: (saleUpdated, id) => {
        return ipcRenderer.invoke('update:sale', saleUpdated, id) 
    },

    updateSaleDetail: (saleUpdated, saleId, productId) => {
        return ipcRenderer.invoke('update:saleDetail', saleUpdated, saleId, productId) 
    },

    updateProductAsUnavailable: (productId) => {
        return ipcRenderer.invoke('update:productAsUnavailable', productId)
    },

    deleteProductFromSaleDetail: (saleId, productId) => {
        return ipcRenderer.invoke('delete:productFromSaleDetail', saleId, productId) 
    },

    deleteSale: (saleId) => {
        return ipcRenderer.invoke('delete:sale', saleId) 
    },

    saveShift: (shiftData, existentShiftId = -1) => {
        return ipcRenderer.invoke('save:shift', shiftData, existentShiftId) 
    },

    saveSaleWithShift: (saleData, isNewSale = true) => {
        return ipcRenderer.invoke('save:saleWithShift', saleData, isNewSale) 
    },

    saveSaleDetail: (saleDetail, isNewSaleDetail = true) => {
        return ipcRenderer.invoke('save:saleDetail', saleDetail, isNewSaleDetail) 
    },

    saveProduct: (productData, isUpdate) => {
        return ipcRenderer.invoke('save:product', productData, isUpdate) 
    },

    existsProductWithCode: (productCode) => {
        return ipcRenderer.invoke('exists:productWithCode', productCode) 
    }
})