const buttonOption1 = document.getElementById('buttonOption1')
const buttonOption2 = document.getElementById('buttonOption2')
const buttonOptions = document.getElementById('buttonShowOptions')
const percentIconLock = document.getElementById('percent__icon-lock')
const saleIconLock = document.getElementById('sale__icon-lock')
const piecesInBoxIconLock = document.getElementById('piecesInBox__icon-lock')
const boxesQuantityIconLock = document.getElementById('boxesQuantity__icon-lock')
const fields = document.querySelectorAll('.form__field')

const code = document.getElementById('code')
const description = document.getElementById('description')
const cost = document.getElementById('cost')
const percent = document.getElementById('percent')
const sale = document.getElementById('sale')
const initialStock = document.getElementById('initialStock')
const minStock = document.getElementById('minStock')
const maxStock = document.getElementById('maxStock')
const piecesInBox = document.getElementById('piecesInBox')
const boxesQuantity = document.getElementById('boxesQuantity')

const fieldsCheck = {
    description: false,
    cost: false,
    code: false,
    percent: false,
    sale: false,
    initialStock: false,
    maxStock: false,
    minStock: false,
    piecesInBox: false,
}


let params
let productToEdit = {}
let editingStatus = false

async function fetchProductdata(){
    return await window.electronAPI.selectProducts(params.productCode)   
}

async function checkForm(event){
    switch(event.target.name){
        case 'code':
            if(event.target.value == ""){
                clearValidations(event.target.name, event.target)
            }else{
                checkCodeField(event.target);
            }
        break;

        case 'description':
            if(event.target.value == ""){
                clearValidations(event.target.name, event.target)
            }else{
                checkDescriptionField('nameProduct', event.target, event.target.name)
            }
        break;

        case 'cost':
            ocultarMensajeCaution(event.target.name, event.target)
            if(event.target.value == ""){
                const sale = document.getElementById('sale')
                const percent = document.getElementById('percent')
                
                disableField(sale)
                saleIconLock.classList.remove('display-none')

                disableField(percent)
                percentIconLock.classList.remove('display-none')

                clearValidations(event.target.name, event.target)

            }else{
                checkCostField('numbers', event.target, event.target.name);
            }
        break;

        case 'percent':
            const sale = document.getElementById('sale')
            if(event.target.value == ""){
                clearValidations(event.target.name, event.target)
                clearValidations(sale.name, sale)
                setFieldSale("")
            }else{
                const testByRegExp = await window.electronAPI.testByRegexp(event.target.value, 'numbers')
                checkSaleFields(testByRegExp && parseFloat(event.target.value) > 0, event.target, sale, testByRegExp);
            }
        break;

        case 'sale':
            if(event.target.value == ""){
                clearValidations(event.target.name, event.target)
            }else{
                const testByRegExp = await window.electronAPI.testByRegexp(event.target.value, 'numbers')
                const percent = document.getElementById('percent')
                const cost = document.getElementById('cost')
                checkSaleFields(testByRegExp && parseFloat(event.target.value) > getFieldCost(), event.target, percent, testByRegExp);
            }
        break;

        case 'initialStock':
            if (event.target.value == ""){
                setFieldBoxesQuantity("")
                clearValidations(event.target.name, event.target)
            } else {
                checkInitialStockField()
            }
        break;

        case 'minStock':
            if(event.target.value == ""){
                clearValidations(event.target.name, event.target)
            }else{
                const maxStock = document.getElementById('maxStock')
                checkStockLimitsField(event.target)

                if(getFieldMaxStock() != "")
                    checkStockLimitsField(maxStock)
            }
        break;

        case 'maxStock':
            if(event.target.value == ""){
                clearValidations(event.target.name, event.target)
            }else{
                const minStock = document.getElementById('minStock')
                checkStockLimitsField(event.target)

                if(getFieldMinStock() != "")
                    checkStockLimitsField(minStock)
            }
        break;

        case 'piecesInBox':
            if(event.target.value == ""){
                setFieldBoxesQuantity("")
                clearValidations(event.target.name, event.target)
            }else{
                checkPiecesInBoxField()
            }
        break;

        case 'boxesQuantity':
        break;
    }
}

async function checkCodeField(){

    if (!await window.electronAPI.testByRegexp(getFieldCode(), 'codeProduct')) {
        establecerIncorrecto(code.name, code, "Símbolos o números raros")
        return
    }

    let isRepeatedCode = await window.electronAPI.existsProductWithCode(getFieldCode())
    isRepeatedCode = editingStatus ? isRepeatedCode && getFieldCode() != productToEdit.codigo : isRepeatedCode
    
    if (isRepeatedCode) {
        establecerIncorrecto(code.name, code, "Código repetido")
        return
    }

    establecerCorrecto(code.name, code)
}

async function checkDescriptionField (nameRegExp, field, fieldName){
    if (!await window.electronAPI.testByRegexp(field.value, nameRegExp)) {
        establecerIncorrecto(fieldName, field, 'Símbolos o números raros');
        return
    }

    if (getFieldDescription().length > 80) {
        establecerIncorrecto(fieldName, field, 'Nombre muy largo');
        return
    }

    establecerCorrecto(description.name, description)

}

async function checkCostField(nameRegExp, field, fieldName){
    const testByRegExp = await window.electronAPI.testByRegexp(field.value, nameRegExp)

    if( testByRegExp && parseFloat(field.value) > 0){
        sale.readOnly = false
        saleIconLock.classList.add('display-none')
        percent.readOnly = false
        percentIconLock.classList.add('display-none')
        establecerCorrecto(fieldName, field)

        if (fieldsCheck.percent){
            const sale = document.getElementById('sale')
            await checkSaleFields(true, percent, sale, true)
        }
    }else{
        disableField(sale)
        saleIconLock.classList.remove('display-none')
        disableField(percent)
        percentIconLock.classList.remove('display-none')
        console.log(field)
        determinateErrorMessageInNumberFields({testByRegExp: testByRegExp, fieldName: fieldName, field: field})
    }
}

async function checkSaleFields(statusQuantity, fieldModified, fieldToModify, testByRegExp){
    switch (statusQuantity) {
        case true:
            const cost = document.getElementById('cost')

            switch (fieldToModify.id) {
                case 'sale':
                    let salePrice = roundToTwo(getFieldCost() + getFieldCost() * (getFieldPercent() / 100.0))
                    setFieldSale(salePrice) 
                    break;
            
                default:
                    let gainPercent = roundToTwo((( getFieldSale() - getFieldCost() ) / getFieldCost()) * 100)
                    setFieldPercent(gainPercent)
                    break;
            }

            establecerCorrecto(sale.name, sale)
            establecerCorrecto(percent.name, percent)
            break;
    
        default:
            fieldToModify.value = ''
            clearValidations(fieldToModify.name, fieldToModify)
            determinateErrorMessageInNumberFields({testByRegExp: testByRegExp, fieldName: fieldModified.name, field: fieldModified})
            break;
    }
    // if( testByRegExp && parseFloat(field.value) > 0){
    // }else{
    // }
}

async function checkStockLimitsField(field){
    const stockElement1 = field
    const stockElement2 = document.getElementById(stockElement1.name == 'minStock' ? 'maxStock' : 'minStock')
    const stockElement1Name = stockElement1.name == 'minStock' ? 'Stock Mínimo' : 'Stock Máximo'
    const stockElement2Name = stockElement1Name == 'Stock Mínimo' ? 'Stock Máximo' : 'Stock Mínimo'

    let errorMessage = ""
    
    if( await window.electronAPI.testByRegexp(stockElement1.value, 'intNumbers') ){
        if (parseInt(stockElement1.value) != 0) {
            if (fieldsCheck[stockElement2.id]) {
                if( parseInt(stockElement1.value) != parseInt(stockElement2.value) ){
                    if( stockElement1.name == 'minStock' ){
                        if( parseInt(stockElement1.value) < parseInt(stockElement2.value) ){
                            establecerCorrecto(stockElement1.name, stockElement1)
                        } else{
                            errorMessage = `El ${stockElement1Name} no puede superar al ${stockElement2Name}`
                        }
                    } else{
                        if ( parseInt(stockElement1.value) > parseInt(stockElement2.value) ){
                            establecerCorrecto(stockElement1.name, stockElement1)
                        } else{
                            errorMessage = `El ${stockElement1Name} no puede ser menor al ${stockElement2Name}`
                        }
                    }
                }else{
                    errorMessage = `El ${stockElement1Name} no puede ser igual al ${stockElement2Name}`
                }
            }else{
                establecerCorrecto(stockElement1.name, stockElement1)
            }
        }else{
            errorMessage = "No puedes poner una cantidad de 0."
        }
    }else{
        errorMessage = `Símbolos o números raros.`
    }

    if(errorMessage != "")
        establecerIncorrecto(stockElement1.name, stockElement1, errorMessage)

} 

async function getParams() {
    return await window.electronAPI.getFromSessionStorage("newProductParams")
}

async function init(){
    params = await getParams()
    enableFieldListeners()
    setButtonsOptions()

    switch(params.visualizationStatus){
        case 'create':
            setTitle("Registrar Nuevo Producto")
            document.querySelectorAll('.input__group')[5].classList.remove('display-none')
            document.querySelectorAll('.input__group')[9].classList.remove('display-none')
            break;
        
        case 'edit':          
            editingStatus = true
            productToEdit = (await fetchProductdata())[0]
            
            setTitle('Modificar datos')

            setFieldCode(productToEdit.codigo)
            setFieldDescription(productToEdit.descrip)
            setFieldCost(productToEdit.cost)
            checkCostField('numbers', cost, cost.name)
            setFieldSale(productToEdit.sale)
            setFieldCurrentStock(productToEdit.stock)
            checkInitialStockField()
            setFieldMinStock(productToEdit.minStock)
            setFieldMaxStock(productToEdit.maxStock)
            setFieldPiecesInBox(productToEdit.piecesInBox)
            checkSaleFields(true, sale, percent, true);
            checkPiecesInBoxField()

            establecerCorrecto(code.name, code)
            establecerCorrecto(description.name, description)
            establecerCorrecto(initialStock.name, initialStock)
            establecerCorrecto(minStock.name, minStock)
            establecerCorrecto(maxStock.name, maxStock)
            break;
        
        default:
            break 
    }

    document.querySelector('form').classList.remove('display-none')

    sale.addEventListener('click', () => {
        if(sale.readOnly){
            cost.focus()
            mostrarMensajeCaution(cost.name, cost, 'Primero debes ingresar el precio de costo.')
        } 
    })

    saleIconLock.addEventListener('click', () => {
        cost.focus()
        mostrarMensajeCaution(cost.name, cost, 'Primero debes ingresar el precio de costo.')
    })

    percent.addEventListener('click', () => {
        if(percent.readOnly){
            cost.focus()
            mostrarMensajeCaution(cost.name, cost, 'Primero debes ingresar el precio de costo.')
        }   
    })

    percentIconLock.addEventListener('click', () => {
        cost.focus()
        mostrarMensajeCaution(cost.name, cost, 'Primero debes ingresar el precio de costo.')
    })
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
                    await window.electronAPI.deleteParams("newProductParams")
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

async function checkInitialStockField(){
    const testByRegExp = await window.electronAPI.testByRegexp(getFieldCurrentStock(true), 'intNumbers')

    if (!testByRegExp) {
        establecerIncorrecto(initialStock.name, initialStock, "Símbolos o números raros")
        return
    }

    if(getFieldCurrentStock() == 0){
        establecerIncorrecto(initialStock.name, initialStock, "No puedes poner una cantidad de 0.")
        return
    }

    establecerCorrecto(initialStock.name, initialStock)
    
    if(getFieldPiecesInBox('string') != "")
        setFieldBoxesQuantity(computeQuantityOfBoxes())
}

async function checkPiecesInBoxField(){
    const testByRegExp = await window.electronAPI.testByRegexp(getFieldPiecesInBox('string'), 'intNumbers')

    if (!testByRegExp) {
        establecerIncorrecto(piecesInBox.name, piecesInBox, "Símbolos o números raros")
        return
    }

    if(parseInt(getFieldPiecesInBox()) == 0){
        establecerIncorrecto(piecesInBox.name, piecesInBox, "No puedes poner una cantidad de 0.")
        return
    }

    establecerCorrecto(piecesInBox.name, piecesInBox)
    
    if(getFieldCurrentStock(true) != "")
        setFieldBoxesQuantity(computeQuantityOfBoxes())
}

function setTitle(newTitle){
    const title = document.getElementById('title')
    title.innerText = newTitle
}

function setFieldCode(codeValue){
    code.value = codeValue
}

function getFieldCode(){
    return code.value
}

function setFieldDescription(descriptionValue){
    description.value = descriptionValue
}

function getFieldDescription(){
    return description.value
}

function setFieldCost(costValue){
    cost.value = costValue != "" ? parseFloat(costValue) : costValue
}

function getFieldCost(){
    return cost.value == "" ? "" : parseFloat(cost.value) 
}

function setFieldSale(saleValue){
    sale.value = saleValue != "" ? parseFloat(saleValue) : saleValue
}

function getFieldSale(){
    return sale.value == "" ? "" : parseFloat(sale.value) 
}

function setFieldPercent(percentValue){
    percent.value = percentValue != "" ? parseFloat(percentValue) : perentValue
}

function getFieldPercent(){
    return percent.value == "" ? "" : parseFloat(percent.value) 
}

function setFieldCurrentStock(currentStockValue){
    initialStock.value = currentStockValue != "" ? parseInt(currentStockValue) : currentStockValue
}

function getFieldCurrentStock(returnAsString = false){
    return returnAsString ? initialStock.value : parseInt(initialStock.value)
}

function setFieldMaxStock(maxStockValue){
    maxStock.value = maxStockValue != "" ? parseInt(maxStockValue) : maxStockValue
}

function getFieldMaxStock(){
    return maxStock.value == "" ? "" : parseInt(maxStock.value)
}

function setFieldMinStock(minStockValue){
    minStock.value = minStockValue != "" ? parseInt(minStockValue) : minStockValue
}

function getFieldMinStock(){
    return minStock.value == "" ? "" : parseInt(minStock.value)   
}

function setFieldPiecesInBox(piecesInBoxValue){
    piecesInBox.value = piecesInBoxValue != "" ? parseInt(piecesInBoxValue) : piecesInBoxValue
}

function getFieldPiecesInBox(returnMode = 'number'){
    return returnMode == "string" ? piecesInBox.value : parseInt(piecesInBox.value)
}

function setFieldBoxesQuantity(boxesQuantityValue){
    boxesQuantity.value = boxesQuantityValue != "" ? parseInt(boxesQuantityValue) : boxesQuantityValue
}

function getFieldBoxesQuantity(){
    return boxesQuantity.value == "" ? "" : parseInt(boxesQuantity.value)
}

function roundToTwo(num) {
    return +(Math.round(num + 'e+2') + 'e-2');
}

function computeQuantityOfBoxes(){
    return Math.ceil( getFieldCurrentStock() / getFieldPiecesInBox() )
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

function disableField(field){
    field.value = ""
    field.readOnly = true
    clearValidations(field.name, field)
}

function determinateErrorMessageInNumberFields({testByRegExp, fieldName, field}){
    let errorMessage = testByRegExp ? (field.value == 0 ? "No puedes poner una cantidad de 0." : "El precio de venta debe superar al precio de costo    ") : "Símbolos o números raros."
    establecerIncorrecto(fieldName, field, errorMessage) 
}

function enableFieldListeners(){
    fields.forEach( field  =>  {
        field.addEventListener('keyup', (event) => checkForm(event))
        field.addEventListener('change', (event) => checkForm(event))
    } )
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
                Codigo__producto: getFieldCode(),
                Descripcion__producto: getFieldDescription(),
                Precio_costo__producto: getFieldCost(),
                Precio_venta__producto: getFieldSale(),
                Cantidad_piezas_por_caja__producto: getFieldPiecesInBox(),
                Cantidad_existencias_actual_inventario__producto: getFieldCurrentStock(),
                Cantidad_existencias_minimas_inventario__producto: getFieldMinStock(),
                Cantidad_existencias_maximas_inventario__producto: getFieldMaxStock(),
            }
            
            editingStatus ? productData.Producto_PK = productToEdit.id : ''
            const productInsertedId = await window.electronAPI.saveProduct(productData, editingStatus)

            if (typeof productInsertedId == "number"){
                await swal({
                    title: editingStatus ? "Producto actualizado exitosamente" : "Producto dado de alta exitosamente",
                    button: {
                        text: 'Aceptar'
                    }
                })
                
                await window.electronAPI.deleteParams('newProductParams')
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
        if (code.value == "") {
            establecerIncorrecto(code.name, code, 'Campo Vacío')
        }

        if (description.value == "") {
            establecerIncorrecto(description.name, description, 'Campo Vacío')
        }

        if (cost.value == "") {
            establecerIncorrecto(cost.name, cost, 'Campo Vacío')
        }

        if (percent.value == "") {
            establecerIncorrecto(percent.name, percent, 'Campo Vacío')
        }

        if (sale.value == "") {
            establecerIncorrecto(sale.name, sale, 'Campo Vacío')
        }

        if (initialStock.value == "") {
            establecerIncorrecto(initialStock.name, initialStock, 'Campo Vacío')
        }

        if (minStock.value == "") {
            establecerIncorrecto(minStock.name, minStock, 'Campo Vacío')
        }

        if (maxStock.value == "") {
            establecerIncorrecto(maxStock.name, maxStock, 'Campo Vacío')
        }

        if (piecesInBox.value == "") {
            establecerIncorrecto(piecesInBox.name, piecesInBox, 'Campo Vacío')
        }

        await showSwalToFillemptyFields()
        buttonOption1.classList.remove('floatbutton__option1-active')
        buttonOption2.classList.remove('floatbutton__option2-active')
    }
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