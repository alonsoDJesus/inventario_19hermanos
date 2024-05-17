const timeFinishField = document.getElementById('timeFinish')
const fieldsCheck = {
    timeFinish: false
}

let intervalID
let saleDataToUpdate = {}
let saleDetailToUpdate = {}
let saleAddends = [0]
let costAddends = [0]
let utilityAddends = [0]

function getTotalAmountOf(addendsArray){
    const totalAmount = addendsArray.reduce( (acumulator, currentValue) => {
        return parseFloat(acumulator + currentValue)
    },)

    return totalAmount
}

function setSaleAddend(index, value) {
    saleAddends[index] = value
}

function getSaleAddends(){
    return saleAddends
}

function setCostAddend(index, value) {
    costAddends[index] = value
}

function getCostAddends(){
    return costAddends
}

function setUtilityAddend(index, value) {
    utilityAddends[index] = value
}

function getUtilityAddends(){
    return utilityAddends
}

function setTitle(text){
    const title = document.getElementById('title')
    title.innerText = text
}

function setTagID(saleID){
    const tagID = document.querySelector('#saleIndex p')
    let numberZeros = 9 - (`${saleID}`.length), tagNumber = "#"

    if(numberZeros > 0){
        tagNumber = tagNumber.concat("0".repeat(numberZeros))
    }
    tagNumber = tagNumber.concat(`${saleID}`)
    tagID.textContent = tagNumber
}

function setFieldName(employeeName){
    const employee = document.getElementById('employee')
    employee.value = employeeName

    establecerCorrecto('employee', employee)
}

function setFieldRoute(routeName){
    const route = document.getElementById('route')
    route.value = routeName

    establecerCorrecto('route', route)
}

function setFieldDate(dateValue){
    const date = document.getElementById('date')
    date.value = dateValue

    establecerCorrecto('date', date)
}

function setFieldTimeStart(time){
    const timeStart = document.getElementById('timeStart')
    timeStart.value = time

    establecerCorrecto('timeStart', timeStart)
}

function setFieldTimeFinish(time){
    timeFinishField.value = time

    establecerCorrecto('timeFinish', timeFinishField)
}

function getInitialPieces(index){
    const paragraphInitialPieces = document.getElementById(`paragraphInitialPieces${index}`)
    return parseInt(paragraphInitialPieces.innerText)
}

function setSaledPieces(initialPieces, finalPieces, index){
    const paragraphSaledPieces = document.getElementById(`paragraphSaledPieces${index}`)
    paragraphSaledPieces.innerText = initialPieces - finalPieces
}

function getSaledPieces(index){
    const paragraphSaledPieces = document.getElementById(`paragraphSaledPieces${index}`)
    return parseInt(paragraphSaledPieces.innerText)
}

function getSalePrice(index) {
    const paragraphSalePrice = document.getElementById(`paragraphSalePrice${index}`)
    return parseFloat(paragraphSalePrice.innerText.replace('$', '').trim())
}

function getCostPrice(index) {
    const paragraphCostPrice = document.getElementById(`paragraphCostPrice${index}`)
    return parseFloat(paragraphCostPrice.innerText.replace('$', '').trim())
}

function setTotalSalePerProduct(salePrice, saledPieces, index) {
    const paragraphSaleData = document.getElementById(`paragraphSaleData${index}`)
    paragraphSaleData.innerText = `$ ${(salePrice * saledPieces).toFixed(2)}`
}

function getTotalSalePerProduct(index){
    const paragraphSaleData = document.getElementById(`paragraphSaleData${index}`)
    return parseFloat(paragraphSaleData.innerText.replace('$', '').trim())
}

function setTotalCostPerProduct(costPrice, saledPieces, index) {
    const paragraphCostData = document.getElementById(`paragraphCostData${index}`)
    paragraphCostData.innerText = `$ ${(costPrice * saledPieces).toFixed()}`
}

function getTotalCostPerProduct(index){
    const paragraphCostData = document.getElementById(`paragraphCostData${index}`)
    return parseFloat(paragraphCostData.innerText.replace('$', '').trim())
}

function setTotalUtilityPerProduct(totalSale, totalCost, index) {
    const paragraphUtilityData = document.getElementById(`paragraphUtilityData${index}`)
    paragraphUtilityData.innerText = `$ ${(totalSale - totalCost).toFixed(2)}`
}

function getTotalUtilityPerProduct(index){
    const paragraphUtilityData = document.getElementById(`paragraphUtilityData${index}`)
    return parseFloat(paragraphUtilityData.innerText.replace('$', '').trim())
}

function setFinalSaleData(value) {
    const finalSaleDataField = document.getElementById('finalSaleData')
    finalSaleDataField.value = `$ ${parseFloat(value).toFixed(2)}`
}

function setFinalCostData(value) {
    const finalCostDataField = document.getElementById('finalCostData')
    finalCostDataField.value = `$ ${parseFloat(value).toFixed(2)}`
}

function setFinalUtilityData(value) {
    const finalUtilityDataField = document.getElementById('finalUtilityData')
    finalUtilityDataField.value = `$ ${parseFloat(value).toFixed(2)}`
}

function getCurrentTime() {
    let date = new Date()
    let hour = date.getHours()
    let minutes = date.getMinutes()
    let seconds = date.getSeconds()
    
    hour = hour >= 0 && hour < 10 ? `0${hour}` : `${hour}`
    minutes = minutes >= 0 && minutes < 10 ? `0${minutes}` : `${minutes}`
    seconds = seconds >= 0 && seconds < 10 ? `0${seconds}` : `${seconds}`

    return `${hour}:${minutes}:${seconds}`
}

function switchModeTime(checked){
    const lockTimeIcon = document.querySelector('.lock-field-icon')
    lockTimeIcon.classList.toggle('display-none')

    if (checked) {
        timeFinishField.readOnly = false
        clearInterval(intervalID)
        intervalID = 0
    } else {
        timeFinishField.readOnly = true

        if (intervalID == 0) {
            intervalID = setInterval(() => {
                setFieldTimeFinish(getCurrentTime())
            }, 1000);
        }
    }
}

// Regulador de la cantidad ingresada por el usario
function regulateQuantity(field, index){
    try {
        field.value = field.value.replace('-', '') // Evita numeros negativos
        if (parseInt(field.value) <= getInitialPieces(index) && field.value != '') { // Si no excede a cantidades iniciales
            // Señalizalo como correcto
            establecerCorrecto(field.id, field)

            // Actualiza el texto de las piezas vendidas
            setSaledPieces(getInitialPieces(index), parseInt(field.value), index)
            setTotalSalePerProduct(getSalePrice(index), getSaledPieces(index), index)
            setTotalCostPerProduct(getCostPrice(index), getSaledPieces(index), index)
            setTotalUtilityPerProduct(getTotalSalePerProduct(index), getTotalCostPerProduct(index), index)
            setSaleAddend(index, getTotalSalePerProduct(index))
            setCostAddend(index, getTotalCostPerProduct(index))
            setUtilityAddend(index, getTotalUtilityPerProduct(index))
            setFinalSaleData(getTotalAmountOf(getSaleAddends()))
            setFinalCostData(getTotalAmountOf(getCostAddends()))
            setFinalUtilityData(getTotalAmountOf(getUtilityAddends()))
        }else{ // Pero si excede a cantidades iniciales o la cantidad es vacía...
            let errorMessage
            field.value == '' ? errorMessage = "Campo vacío" : errorMessage = "Cantidad Excedente"
            establecerIncorrecto(field.id, field, errorMessage)

            setSaleAddend(index, 0)
            setCostAddend(index, 0)
            setUtilityAddend(index, 0)
            setFinalSaleData(getTotalAmountOf(getSaleAddends()))
            setFinalCostData(getTotalAmountOf(getCostAddends()))
            setFinalUtilityData(getTotalAmountOf(getUtilityAddends()))

            console.log(getTotalAmountOf(getUtilityAddends()))
        }
    } catch (error) { // Si ocurre algun error, entonces
        if (error instanceof TypeError) {
            // sentencias para manejar excepciones TypeError
        } 
    }
}

function setValidations(fields) {
    fields.forEach((field, index) => {
        field.addEventListener('keyup', () => {
            regulateQuantity(field, index+1)
        })

        field.addEventListener('change', () => {
            regulateQuantity(field, index+1)
        })
    })
}

function renderSaleDetail(isReadOnly = false) {
    const containerSaleDetail = document.querySelector('.saledetail__containercards')
    // let indexChild = containerSales.childNodes.length - 1

    // while (indexChild != 2) {
    //     containerSales.removeChild(containerSales.childNodes[indexChild])
    //     indexChild--
    // }

    saleDetailToUpdate.forEach( (saleDetailElement, index) => {
        // Group Card
        const groupCard = document.createElement('div')
        groupCard.classList.add('saledetail__groupcard')

        // Card
        const card = document.createElement('article')
        card.classList.add('saledetail__card')
        card.classList.add('position-relative')

        // Card Data
        const cardData = document.createElement('div')
        cardData.classList.add('card__data')

        // Elementos del data
        const divDescription = document.createElement('div')
        divDescription.classList.add('data')
        divDescription.id = saleDetailElement.idProducto

        const paragraphDescription = document.createElement('p')
        paragraphDescription.innerText = saleDetailElement.descripcion
        
        divDescription.appendChild(paragraphDescription)
        cardData.appendChild(divDescription)
        //------------------------------------------------------------------------
        const divInitialPieces = document.createElement('div')
        divInitialPieces.classList.add('data')

        const paragraphInitialPieces = document.createElement('p')
        paragraphInitialPieces.innerText = saleDetailElement.piezasEntregadas
        paragraphInitialPieces.id = `paragraphInitialPieces${index+1}`

        divInitialPieces.appendChild(paragraphInitialPieces)
        cardData.appendChild(divInitialPieces)
        //------------------------------------------------------------------------
        const divField = document.createElement('div')
        divField.classList.add('input__group')
        divField.classList.add('position-relative')
        divField.classList.add('data')

        const inputFinalPieces = document.createElement('input')
        inputFinalPieces.type = "number"
        inputFinalPieces.classList.add('card__field')
        inputFinalPieces.classList.add('bg-primary')
        inputFinalPieces.readOnly = isReadOnly
        inputFinalPieces.id = `finalPieces${index+1}`

        const divValidation = document.createElement('div')
        divValidation.classList.add('formulario__validacion-estado')
        divValidation.classList.add('icon-wrong')
        divValidation.classList.add('opacity-0')
        divValidation.classList.add('val__replacer')
        divValidation.id = `finalPieces${index+1}__val`

        const paragraphValidation = document.createElement('p')
        paragraphValidation.classList.add('formulario__input-error')
        paragraphValidation.id = `finalPieces${index+1}__warning`
        paragraphValidation.innerText = "Cantidad Excedente"

        divField.appendChild(inputFinalPieces)
        divField.appendChild(divValidation)
        divField.appendChild(paragraphValidation)
        cardData.appendChild(divField)
        //-------------------------------------------------------------------------
        const divSaledPieces = document.createElement('div')
        divSaledPieces.classList.add('data')

        const paragraphSaledPieces = document.createElement('p')
        paragraphSaledPieces.innerText = "00000"
        paragraphSaledPieces.id = `paragraphSaledPieces${index+1}`

        divSaledPieces.appendChild(paragraphSaledPieces)
        cardData.appendChild(divSaledPieces)
        //-------------------------------------------------------------------------
        const divCostPrice = document.createElement('div')
        divCostPrice.classList.add('data')

        const paragraphCostPrice = document.createElement('p')
        paragraphCostPrice.innerText = `$ ${saleDetailElement.precioCosto}`
        paragraphCostPrice.id = `paragraphCostPrice${index+1}`

        divCostPrice.appendChild(paragraphCostPrice)
        cardData.appendChild(divCostPrice)
        //-------------------------------------------------------------------------
        const divSalePrice = document.createElement('div')
        divSalePrice.classList.add('data')

        const paragraphSalePrice = document.createElement('p')
        paragraphSalePrice.innerText = `$ ${saleDetailElement.precioVenta}`
        paragraphSalePrice.id = `paragraphSalePrice${index+1}`

        divSalePrice.appendChild(paragraphSalePrice)
        cardData.appendChild(divSalePrice)

        card.appendChild(cardData)
        groupCard.appendChild(card)
        
        // Subcard
        const subCard = document.createElement('article')
        subCard.classList.add('saledetail__subcard')

        // SubCard Data
        const subCardData = document.createElement('div')
        subCardData.classList.add('subcard__data')

        // Elementos del data
        const divSale = document.createElement('div')
        divSale.classList.add('subcard__containersubdata')

        const divSaleHeader = document.createElement('div')
        divSaleHeader.classList.add('containersubdata__header')

        const paragraphSaleHeader = document.createElement('p')
        paragraphSaleHeader.innerText = "Venta:"

        divSaleHeader.appendChild(paragraphSaleHeader)

        const divSaleData= document.createElement('div')
        divSaleData.classList.add('containersubdata__subdata')

        const paragraphSaleData = document.createElement('p')
        paragraphSaleData.innerText = "$ 000,000.00"
        paragraphSaleData.id = `paragraphSaleData${index+1}`

        divSaleData.appendChild(paragraphSaleData)

        divSale.appendChild(divSaleHeader)
        divSale.appendChild(divSaleData)
        subCardData.appendChild(divSale)
        //----------------------------------------------------------------------------------
        const divCost = document.createElement('div')
        divCost.classList.add('subcard__containersubdata')

        const divCostHeader = document.createElement('div')
        divCostHeader.classList.add('containersubdata__header')

        const paragraphCostHeader = document.createElement('p')
        paragraphCostHeader.innerText = "Costo:"

        divCostHeader.appendChild(paragraphCostHeader)

        const divCostData= document.createElement('div')
        divCostData.classList.add('containersubdata__subdata')

        const paragraphCostData = document.createElement('p')
        paragraphCostData.innerText = "$ 000,000.000"
        paragraphCostData.id = `paragraphCostData${index+1}`

        divCostData.appendChild(paragraphCostData)

        divCost.appendChild(divCostHeader)
        divCost.appendChild(divCostData)
        subCardData.appendChild(divCost)
        //-----------------------------------------------------------------------------------
        const divUtility = document.createElement('div')
        divUtility.classList.add('subcard__containersubdata')

        const divUtilityHeader = document.createElement('div')
        divUtilityHeader.classList.add('containersubdata__header')

        const paragraphUtilityHeader = document.createElement('p')
        paragraphUtilityHeader.innerText = "Utilidad:"

        divUtilityHeader.appendChild(paragraphUtilityHeader)

        const divUtilityData= document.createElement('div')
        divUtilityData.classList.add('containersubdata__subdata')

        const paragraphUtilityData = document.createElement('p')
        paragraphUtilityData.innerText = "$ 000,000.00"
        paragraphUtilityData.id = `paragraphUtilityData${index+1}`

        divUtilityData.appendChild(paragraphUtilityData)

        divUtility.appendChild(divUtilityHeader)
        divUtility.appendChild(divUtilityData)
        subCardData.appendChild(divUtility)
        //-----------------------------------------------------------------------------------
        subCard.appendChild(subCardData)
        groupCard.appendChild(subCard)

        containerSaleDetail.appendChild(groupCard)
    });

    if(!isReadOnly){
        setValidations(document.querySelectorAll('.card__field'))
    }

    // for (let index = 0; index < saleDetailToUpdate.length; index++) {

    // }
}

async function setsaleDetailToUpdate(id){
    saleDetailToUpdate = await window.electronAPI.selectSaleDetailById(id)
}
    
async function getParams() {
    return await window.electronAPI.getParams("completingSaleParams")
}

async function getSaleDataById(id){
    return await window.electronAPI.selectSaleById(id)
}

async function init(){
    const checkTime = document.getElementById('checkTime')
    
    const params = await getParams()
    const saleDataFetched = await getSaleDataById(params.index)

    intervalID = 0

    setFieldName(saleDataFetched.nombre)
    setFieldRoute(saleDataFetched.ruta)
    setFieldDate(saleDataFetched.fecha)
    setFieldTimeStart(saleDataFetched.salida)
    await setsaleDetailToUpdate(params.index)

    switch (params.editingStatusOfCompletingSale) {
        case true:
            setTitle("Finalizar Venta")
            setTagID(params.index)
            switchModeTime(checkTime.checked)
            renderSaleDetail()

            checkTime.addEventListener('click', () => {
                switchModeTime(checkTime.checked)
            })
            break;
    
        default:
            break;
    }
}

async function confirmToExit(goToSomewhere, swalIcon){
    await swal({
        icon: swalIcon,
        title: "¿Seguro que quiere salir?",
        text: 'Su avance se perderá :(',
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
                await goToSomewhere()
                break;
         
            default:
                break;
          }
    })
}

window.addEventListener('load', () => {
    const navHome = document.getElementById('navHome')
    const navNewSale = document.getElementById('navNewSale')
    const navCompletedSales = document.getElementById('navCompletedSales')

    let goToSomeWhere;
    
    navHome.addEventListener('click', () => {
        goToSomeWhere = async function(){
            await window.electronAPI.navigateTo(links.home)
        }
        confirmToExit(goToSomeWhere, "warning")
    })

    navNewSale.addEventListener('click', () => {
        goToSomeWhere = async function(){
            await window.electronAPI.navigateTo(links.newSale)
        }
        confirmToExit(goToSomeWhere, "warning")
    })

    navCompletedSales.addEventListener('click', () => {
        goToSomeWhere = async function(){
            await window.electronAPI.navigateTo(links.completedSales)
        }
        confirmToExit(goToSomeWhere, "warning")
    })
})

init()