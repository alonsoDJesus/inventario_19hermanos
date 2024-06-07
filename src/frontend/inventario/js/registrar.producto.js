const buttonOption1 = document.getElementById('buttonOption1')
const buttonOption2 = document.getElementById('buttonOption2')
const buttonOptions = document.getElementById('buttonShowOptions')
const percentIconLock = document.getElementById('percent__icon-lock')
const saleIconLock = document.getElementById('sale__icon-lock')
const piecesInBoxIconLock = document.getElementById('piecesInBox__icon-lock')
const boxesQuantityIconLock = document.getElementById('boxesQuantity__icon-lock')

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
    boxesQuantity: false
}

async function checkForm(event){
    switch(event.target.name){
        case 'code':
            if(event.target.value == ""){
                clearValidations(event.target.name, event.target)
            }else{
                checkCodeField('codeProduct', event.target, event.target.name);
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
                sale.value = ""
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
                checkSaleFields(testByRegExp && parseFloat(event.target.value) > parseFloat(cost.value), event.target, percent, testByRegExp);
            }
        break;

        case 'initialStock':
            ocultarMensajeCaution(event.target.name, event.target)
            if(event.target.value == ""){
                const piecesInBox = document.getElementById('piecesInBox')
                const boxesQuantity = document.getElementById('boxesQuantity')
                clearValidations(event.target.name, event.target)
                disableField(piecesInBox)
                disableField(boxesQuantity)
                piecesInBoxIconLock.classList.remove('display-none')
            }else{
                checkInitialStockField()
            }
        break;

        case 'minStock':
            if(event.target.value == ""){
                clearValidations(event.target.name, event.target)
            }else{
                const maxStock = document.getElementById('maxStock')
                checkStockLimitsField(event.target)

                if(maxStock.value != "")
                    checkStockLimitsField(maxStock)
            }
        break;

        case 'maxStock':
            if(event.target.value == ""){
                clearValidations(event.target.name, event.target)
            }else{
                const minStock = document.getElementById('minStock')
                checkStockLimitsField(event.target)

                if(minStock.value != "")
                    checkStockLimitsField(minStock)
            }
        break;

        case 'piecesInBox':
            if(event.target.value == ""){
                const boxesQuantity = document.getElementById('boxesQuantity')
                clearValidations(event.target.name, event.target)
                disableField(boxesQuantity)
            }else{
                checkPiecesInBoxField()
            }
        break;

        case 'boxesQuantity':
        break;
    }
}

async function checkCodeField(){
    const code = document.getElementById('code')

    if ( await window.electronAPI.testByRegexp(code.value, 'codeProduct')){
        const isRepeatedCode = await window.electronAPI.existsProductWithCode(code.value)
        if (!isRepeatedCode) 
            establecerCorrecto(code.name, code)
        else
            establecerIncorrecto(code.name, code, "Código repetido")
    }else {
        establecerIncorrecto(code.name, code, "No puedes escribir símbolos o números raros.")
    }
}

async function checkDescriptionField (nameRegExp, field, fieldName){
    if(await window.electronAPI.testByRegexp(field.value, nameRegExp)){
        establecerCorrecto(fieldName, field);
        
    }else{     
        establecerIncorrecto(fieldName, field);
    }

}

async function checkCostField(nameRegExp, field, fieldName){
    const testByRegExp = await window.electronAPI.testByRegexp(field.value, nameRegExp)
    const sale = document.getElementById('sale')
    const percent = document.getElementById('percent')

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

        determinateErrorMessageInNumberFields({testByRegExp: testByRegExp, fieldName: fieldName, field: field})
    }
}

async function checkSaleFields(statusQuantity, fieldModified, fieldToModify, testByRegExp){
    switch (statusQuantity) {
        case true:
            const cost = document.getElementById('cost')

            switch (fieldToModify.id) {
                case 'sale':
                    let salePrice = roundToTwo(parseFloat(cost.value) + parseFloat(cost.value) * (parseFloat(fieldModified.value) / 100.0))
                    fieldToModify.value = salePrice 
                    break;
            
                default:
                    let gainPercent = roundToTwo((( parseFloat(fieldModified.value) - parseFloat(cost.value) ) / cost.value) * 100)
                    fieldToModify.value = gainPercent
                    break;
            }

            establecerCorrecto(fieldModified.name, fieldModified)
            establecerCorrecto(fieldToModify.name, fieldToModify)
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
        errorMessage = `No puedes escribir símbolos o números raros.`
    }

    if(errorMessage != "")
        establecerIncorrecto(stockElement1.name, stockElement1, errorMessage)

} 

async function getParams() {
    return await window.electronAPI.getFromSessionStorage("newProductParams")
}

async function init(){
    const params = await getParams()

    switch(params.visualizationStatus){
        case 'create':
            enableFieldListeners()
            setButtonsOptions()

            saleIconLock.addEventListener('click', () => {
                const cost = document.getElementById('cost')
                
                cost.focus()
                mostrarMensajeCaution(cost.name, cost, 'Primero debes ingresar el precio de costo.')
            })

            percentIconLock.addEventListener('click', () => {
                const cost = document.getElementById('cost')
                
                cost.focus()
                mostrarMensajeCaution(cost.name, cost, 'Primero debes ingresar el precio de costo.')
            })

            piecesInBoxIconLock.addEventListener('click', () => {
                const initialStock = document.getElementById('initialStock')
                
                initialStock.focus()
                mostrarMensajeCaution(initialStock.name, initialStock, 'Primero debes ingresar el stock inicial')
            })

            boxesQuantityIconLock.addEventListener('click', () => {
                const boxesQuantity = document.getElementById('boxesQuantity')
                mostrarMensajeCaution(boxesQuantity.name, boxesQuantity, 'Este dato no puede editarse, es automático')

                setTimeout(() => {
                    ocultarMensajeCaution(boxesQuantity.name, boxesQuantity)
                }, 5000);
            })
            break;
        
        case 'edit':
            break;
        
        default:
            break 
    }
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
    const initialStock = document.getElementById('initialStock')
    const testByRegExp = await window.electronAPI.testByRegexp(initialStock.value, 'intNumbers')
    const piecesInBox = document.getElementById('piecesInBox')
    if( testByRegExp && parseInt(initialStock.value) > 0 ){
        establecerCorrecto(initialStock.name, initialStock)
        piecesInBox.readOnly = false
        piecesInBoxIconLock.classList.add('display-none')

        if(piecesInBox.value != "")
            checkPiecesInBoxField()
    }else{
        const boxesQuantity = document.getElementById('boxesQuantity')
        let errorMessage = testByRegExp ?  "No puedes poner una cantidad de 0." : "No puedes escribir símbolos o números raros." 
        establecerIncorrecto(initialStock.name, initialStock, errorMessage)
        disableField(boxesQuantity)
    }
}

async function checkPiecesInBoxField(){
    const initialStock = document.getElementById('initialStock')
    const piecesInBox = document.getElementById('piecesInBox')
    const boxesQuantity = document.getElementById('boxesQuantity')
    const testByRegExp = await window.electronAPI.testByRegexp(piecesInBox.value, 'intNumbers')

    if( testByRegExp && piecesInBox != 0 ){
        boxesQuantity.value = Math.ceil( parseInt(initialStock.value) / parseInt(piecesInBox.value) ) 
        establecerCorrecto(piecesInBox.name, piecesInBox)
        establecerCorrecto(boxesQuantity.name, boxesQuantity)
    }else{
        boxesQuantity.value = ''
        clearValidations(boxesQuantity.name, boxesQuantity)

        const errorMessage = testByRegExp ?  "No puedes poner una cantidad de 0." : "No puedes escribir símbolos o números raros."
        establecerIncorrecto(piecesInBox.name, piecesInBox, errorMessage) 
    }
}

function roundToTwo(num) {
    return +(Math.round(num + 'e+2') + 'e-2');
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
    let errorMessage = testByRegExp ? (field.value == 0 ? "No puedes poner una cantidad de 0." : "El precio de venta debe superar al precio de costo    ") : "No puedes escribir símbolos o números raros."
    establecerIncorrecto(fieldName, field, errorMessage) 
}

function enableFieldListeners(){
    const fields = document.querySelectorAll('.form__field')
    fields.forEach( field  =>  {
        field.addEventListener('keyup', (event) => checkForm(event))
        field.addEventListener('change', (event) => checkForm(event))
    } )
}

function setButtonsOptions(isReadOnly = false){
    
    if (!isReadOnly) {
        buttonOption1.children[0].src = icons.checkWhite
        buttonOption1.addEventListener('click', () => {
            saveSaleDetail()
        })

        buttonOption2.children[0].src = icons.xmarkWhite
        buttonOption2.addEventListener('click', () => {
            cancelSaleDetail()
        })
    }

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
        await window.electronAPI.navigateTo(links.home)
    }
    showSwalConfirm(goToSomeWhere, confirmContent)
}

function saveSaleDetail() {
    const statusValidation = getStatusValidationFields()

    if (statusValidation) {
        const saveProductTask = async () => {
            const fields = document.querySelectorAll('.form__field')

            const productData = {
                Codigo__producto: fields[0].value,
                Descripcion__producto: fields[1].value,
                Precio_costo__producto: parseFloat(fields[2].value),
                Precio_venta__producto: parseFloat(fields[4].value),
                Cantidad_piezas_por_caja__producto: parseInt(fields[8].value),
                Cantidad_existencias_actual_inventario__producto: parseInt(fields[5].value),
                Cantidad_existencias_minimas_inventario__producto: parseInt(fields[6].value),
                Cantidad_existencias_maximas_inventario__producto: parseInt(fields[7].value),
            }
            
            const productInsertedId = await window.electronAPI.insertNewProduct(productData)

            if (typeof productInsertedId == "number"){
                await swal({
                    title: "Producto dado de alta exitosamente",
                    button: {
                        text: 'Aceptar'
                    }
                })

                await window.electronAPI.deleteParams('newProductParams')
                await window.electronAPI.navigateTo(links.home)
            }
        }

        const confirmContent = {
            icon: 'warning',
            title: '¿Seguro que quieres guardar los datos?',
            text: 'Los datos que ingresaste deben ser correctos',
        }

        showSwalConfirm(undefined, confirmContent, saveProductTask)

    } else{
        const errorMessageForm = document.getElementById('errorMessageForm')
        errorMessageForm.classList.add('formulario__data-error')
        errorMessageForm.classList.remove('display-none')

        buttonOption1.classList.toggle('floatbutton__option1-active')
        buttonOption2.classList.toggle('floatbutton__option2-active')

        setTimeout(() => {
            errorMessageForm.classList.remove('formulario__data-error')
            errorMessageForm.classList.add('display-none')
        }, 5000);
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