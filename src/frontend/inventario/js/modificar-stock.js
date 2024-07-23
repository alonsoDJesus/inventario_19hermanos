const description = document.getElementById('description')
const currentStock = document.getElementById('currentStock')
const newStock = document.getElementById('newStock')
const modification = document.getElementById('modification')
const reason = document.getElementById('reason')
const piecesInBox = document.getElementById('piecesInBox')
const boxesQuantity = document.getElementById('boxesQuantity')
const buttonOption1 = document.getElementById('buttonOption1')
const buttonOption2 = document.getElementById('buttonOption2')
const buttonOptions = document.getElementById('buttonShowOptions')

let productParams = {}
let productToEdit = {}
let fieldsCheck = {
    modification: false,
    reason: false,
    piecesInBox: false
}

function getStatusValidationFields(){
    const initialValue = true
    const fieldsCheckArray = Object.values(fieldsCheck)
    const statusValidation = fieldsCheckArray.reduce( (acumulator, currentValue) => {
        return acumulator && currentValue
    },
    initialValue
    )

    return statusValidation
}

function setFieldDescription(descriptionValue){
    description.value = descriptionValue
}

function setFieldCurrentStock(currentStockValue){
    currentStock.value = currentStockValue
}

function getFieldCurrentStock(){
    return currentStock.value == "" ? "" : parseInt(currentStock.value)
}

function getFieldModification(returnMode = 'number') {
    return returnMode == 'string' ? modification.value  : parseInt( modification.value ) 
}

function getFieldReason(returnMode = 'index'){
    if (returnMode == 'index')
        return reason.selectedIndex

    if (returnMode == 'value')
        return reason.value
}

function setFieldNewStock(newStockValue){
    newStock.value = newStockValue
}

function getFieldNewStock(returnMode = 'number') {
    return returnMode == 'string' ? newStock.value  : parseInt( newStock.value ) 
}

function setFieldPiecesInBox(piecesInBoxValue){
    piecesInBox.value = piecesInBoxValue
}

function getFieldPiecesInBox(returnMode = 'number'){
    return returnMode == 'string' ? piecesInBox.value  : parseInt( piecesInBox.value )
}

function setFieldBoxesQuantity(boxesQuantityValue){
    boxesQuantity.value = boxesQuantityValue
}

function computeNewStock() {
    return getFieldCurrentStock() + getFieldModification()
}

function computeBoxesQuantity(){
    return Math.ceil( getFieldNewStock() / getFieldPiecesInBox() )
}

function setButtonsOptions() {

    buttonOption1.children[0].src = icons.checkWhite
    buttonOption1.addEventListener('click', () => {
        saveProductData()
    })

    buttonOption2.children[0].src = icons.xmarkWhite
    buttonOption2.addEventListener('click', () => {
        cancelSaleDetail()
    })

    buttonOptions.onclick = function () {
        buttonOption1.classList.toggle('floatbutton__option1-active')
        buttonOption2.classList.toggle('floatbutton__option2-active')
    }
}

function cancelSaleDetail() {
    const confirmContent = {
        icon: 'warning',
        title: '¿Seguro que quieres salir?',
        text: 'Todo su avance se perderá',
    }

    goToSomeWhere = async function(){
        await window.electronAPI.navigateTo(links.stock)
    }
    showSwalConfirm(goToSomeWhere, confirmContent)
}

async function saveProductData() {
    const statusValidation = getStatusValidationFields()

    if (statusValidation) {
        const saveProductTask = async () => {

            const productData = {
                Producto_PK: productToEdit.id,
                Cantidad_piezas_por_caja__producto: getFieldPiecesInBox(),
                Cantidad_existencias_actual_inventario__producto: getFieldNewStock(),
                Ultimo_movimiento__producto: getFieldReason('value')
            }
            
            const productInsertedId = await window.electronAPI.saveProduct(productData, true)

            if (typeof productInsertedId == "number"){
                await swal({
                    title: "Producto actualizado exitosamente",
                    button: {
                        text: 'Aceptar'
                    }
                })
                
                await window.electronAPI.deleteParams('productParams')
                await window.electronAPI.navigateTo(links.stock)
            }
        }

        const confirmContent = {
            icon: 'warning',
            title: '¿Seguro que quieres guardar los datos?',
            text: 'Los datos que ingresaste deben ser correctos',
        }

        showSwalConfirm(undefined, confirmContent, saveProductTask)

    } else{
        if (getFieldModification('string') == "") {
            establecerIncorrecto(modification.name, modification, 'Campo Vacío')
        }

        if (getFieldModification('string') != "") {
            establecerIncorrecto(modification.name, modification, 'Símbolos o números raros')
        }

        if (getFieldReason() == 0) {
            establecerIncorrecto(reason.name, reason, 'Selecciona un motivo')
        }

        if (piecesInBox.value == "") {
            establecerIncorrecto(piecesInBox.name, piecesInBox, 'Campo Vacío')
        }

        await showSwalToFillemptyFields()
        buttonOption1.classList.remove('floatbutton__option1-active')
        buttonOption2.classList.remove('floatbutton__option2-active')
    }
}

async function init(){
    productParams = await getParams()
    productToEdit = (await fetchProductdata())[0]
    setFieldDescription(productToEdit.descrip)
    setFieldCurrentStock(productToEdit.stock)
    setFieldPiecesInBox(productToEdit.piecesInBox)
    setButtonsOptions()

    establecerCorrecto(piecesInBox.name, piecesInBox)

    modification.addEventListener('keyup', async () => {
        if (getFieldModification('string') === "") {
            clearValidations(modification.name, modification)
            setFieldNewStock(productToEdit.stock)
            setFieldBoxesQuantity(computeBoxesQuantity())
            return
        }
    
        if (getFieldModification('string') == "-") {
            clearValidations(modification.name, modification)
            setFieldNewStock(productToEdit.stock)
            setFieldBoxesQuantity(computeBoxesQuantity())
            return
        }

        if( !(await window.electronAPI.testByRegexp(getFieldModification('string'), 'positiveNegativeIntNumbers')) ){
            establecerIncorrecto(modification.name, modification, "Símbolos o números raros")
            setFieldNewStock(productToEdit.stock)
            setFieldBoxesQuantity(computeBoxesQuantity())
            return
        }

        if (getFieldModification() == 0) {
            establecerIncorrecto(modification.name, modification, "No se acepta 0")
            setFieldNewStock(productToEdit.stock)
            setFieldBoxesQuantity(computeBoxesQuantity())
            return
        }

        let newStock = computeNewStock()

        if(newStock < 0){
            establecerIncorrecto(modification.name, modification, "Stock superado")
            setFieldNewStock(productToEdit.stock)
            setFieldBoxesQuantity(computeBoxesQuantity())
            return
        }

        setFieldNewStock(newStock)
        establecerCorrecto(modification.name, modification)

        if(fieldsCheck.piecesInBox){
            setFieldBoxesQuantity(computeBoxesQuantity())
        }
    })

    reason.addEventListener('change', () => {
        establecerCorrecto(reason.name, reason)
    })

    piecesInBox.addEventListener('keyup', async () => {
        if (getFieldPiecesInBox('string') === "") {
            clearValidations(piecesInBox.name, piecesInBox)
            setFieldBoxesQuantity("")
            return
        }

        if( !(await window.electronAPI.testByRegexp(getFieldPiecesInBox('string'), 'positiveNegativeIntNumbers')) ){
            establecerIncorrecto(piecesInBox.name, piecesInBox, "Símbolos o números raros")
            setFieldBoxesQuantity("")
            return
        }

        if (getFieldPiecesInBox() == 0) {
            establecerIncorrecto(piecesInBox.name, piecesInBox, "No se acepta 0")
            setFieldBoxesQuantity("")
            return
        }

        establecerCorrecto(piecesInBox.name, piecesInBox)
        setFieldBoxesQuantity(computeBoxesQuantity())
    })
}

async function getParams() {
    return await window.electronAPI.getFromSessionStorage("productParams")
}

async function fetchProductdata(){
    return await window.electronAPI.selectProducts(productParams.productCode)   
}

async function showSwalConfirm(goToSomewhere, confirmContent, specialTask = undefined){
    await swal({
        icon: confirmContent.icon,
        title: confirmContent.title,
        text: confirmContent.text,
        padding: '1.4rem',
        buttons: {
            cancel: {
                text: 'Cancelar',
                value: null,
                visible: true,
                closeModal: true
            },

            confirm: {
                text: "Aceptar",
                value: true,
                visible: true,
                closeModal: true
            }
        }
    }).then(async (value) => {
        switch (value) {

            case true:
                if (specialTask != undefined) {
                    await specialTask()
                }else{
                    //await window.electronAPI.deleteParams("newSaleParams")
                    await window.electronAPI.deleteParams("productParams")
                    //sessionStorage.removeItem("index")
                    //sessionStorage.removeItem("addedSales")
                    await goToSomewhere()
                }
                
                break;
         
            default:
                //buttonOption1.classList.remove('button_save_active')
                //buttonOption2.classList.remove('button_cancel_active')
                break;
          }
    })
}

window.addEventListener('load', () => {
    const navHome = document.getElementById('navHome')
    const navNewSale = document.getElementById('navNewSale')
    const navCompletedSales = document.getElementById('navCompletedSales')
    const navInitiatedSales = document.getElementById('navInitiatedSales')
    const navStock = document.getElementById('navStock')
    const navNewProduct = document.getElementById('navNewProduct')    

    let goToSomeWhere;
    
    navHome.addEventListener('click', () => {
        const confirmContent = {
            icon: 'warning',
            title: '¿Seguro que quieres salir?',
            text: 'Todo su avance se perderá',
        }

        goToSomeWhere = async function(){
            await window.electronAPI.navigateTo(links.home)
        }
        showSwalConfirm(goToSomeWhere, confirmContent)
    })

    navNewSale.addEventListener('click', () => {
        const confirmContent = {
            icon: 'warning',
            title: '¿Seguro que quieres salir?',
            text: 'Todo su avance se perderá',
        }

        goToSomeWhere = async function(){
            await window.electronAPI.navigateTo(links.newSale)
        }
        showSwalConfirm(goToSomeWhere, confirmContent)
    })

    navInitiatedSales.addEventListener('click', async () => {
        const confirmContent = {
            icon: 'warning',
            title: '¿Seguro que quieres salir?',
            text: 'Todo su avance se perderá',
        }

        goToSomeWhere = async function(){
            await window.electronAPI.navigateTo(links.home)
        }
        showSwalConfirm(goToSomeWhere, confirmContent)
    })

    navCompletedSales.addEventListener('click', () => {
        const confirmContent = {
            icon: 'warning',
            title: '¿Seguro que quieres salir?',
            text: 'Todo su avance se perderá',
        }

        goToSomeWhere = async function(){
            await window.electronAPI.navigateTo(links.completedSales)
        }
        showSwalConfirm(goToSomeWhere, confirmContent)
    })

    navStock.addEventListener('click', async () => {
        const confirmContent = {
            icon: 'warning',
            title: '¿Seguro que quieres salir?',
            text: 'Todo su avance se perderá',
        }

        goToSomeWhere = async function(){
            await window.electronAPI.navigateTo(links.stock)
        }
        showSwalConfirm(goToSomeWhere, confirmContent)
    })

    navNewProduct.addEventListener('click', async() => {
        const confirmContent = {
            icon: 'warning',
            title: '¿Seguro que quieres salir?',
            text: 'Todo su avance se perderá',
        }

        goToSomeWhere = async function(){
            await window.electronAPI.navigateTo(links.newProduct, -1, 'create')
        }
        
        showSwalConfirm(goToSomeWhere, confirmContent)
    })
})

init()