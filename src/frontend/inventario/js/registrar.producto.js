const fieldsCheck = {
    description: false,
    cost: false,
    code: false,
    percent: false,
    sale: false,
    initalStock: false,
    maxStock: false,
    minStock: false,
    piecesInBox: false
}

async function checkForm(event){
    switch(event.target.name){
        case 'code':
            if(event.target.value == ""){
                clearValidations(event.target.name, event.target)
            }else{
                checkTextField('codeProduct', event.target, event.target.name);
            }
        break;

        case 'description':
            if(event.target.value == ""){
                clearValidations(event.target.name, event.target)
            }else{
                checkTextField('nameProduct', event.target, event.target.name)
            }
        break;

        case 'cost':
            if(event.target.value == ""){
                const sale = document.getElementById('sale')
                const percent = document.getElementById('percent')
                clearValidations(event.target.name, event.target)
                disableField(sale)
                disableField(percent)
            }else{
                checkCostField('numbers', event.target, event.target.name);
            }
        break;

        case 'percent':
            if(event.target.value == ""){
                clearValidations(event.target.name, event.target)
            }else{
                const testByRegExp = await window.electronAPI.testByRegexp(event.target.value, 'numbers')
                const sale = document.getElementById('sale')
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
            if(event.target.value == ""){
                const piecesInBox = document.getElementById('piecesInBox')
                const boxesQuantity = document.getElementById('boxesQuantity')
                clearValidations(event.target.name, event.target)
                disableField(piecesInBox)
                disableField(boxesQuantity)
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

async function checkTextField (nameRegExp, field, fieldName){
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
        percent.readOnly = false
        establecerCorrecto(fieldName, field)

        if (fieldsCheck.percent){
            const sale = document.getElementById('sale')
            await checkSaleFields(true, percent, sale, true)
        }
    }else{
        disableField(sale)
        disableField(percent)

        determinateErrorMessageInNumberFields({testByRegExp: testByRegExp, fieldName: fieldName, field: field})
    }
}

async function checkSaleFields(statusQuantity, fieldModified, fieldToModify, testByRegExp){
    switch (statusQuantity) {
        case true:
            const cost = document.getElementById('cost')

            switch (fieldToModify.id) {
                case 'sale':
                    let salePrice = parseFloat(cost.value) + parseFloat(cost.value) * (parseFloat(fieldModified.value) / 100.0)
                    fieldToModify.value = salePrice 
                    break;
            
                default:
                    let gainPercent = (( parseFloat(fieldModified.value) - parseFloat(cost.value) ) / cost.value) * 100
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
        establecerIncorrecto(piecesInBox.name, piecesInBox) 
    }
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

window.addEventListener('load', () => {
    const navHome = document.getElementById('navHome')
    const navNewSale = document.getElementById('navNewSale')
    const navCompletedSales = document.getElementById('navCompletedSales')
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