const employees = document.getElementById('employees')
const routes = document.getElementById('routes')
const tagID = document.querySelector('.form__tagnumber p')
const dateField = document.getElementById('date')
const timeField = document.getElementById('time')
const dateCheck = document.getElementById('checkDate')
const timeCheck = document.getElementById('checkTime')
const buttonAddSale = document.getElementById('buttonAddSale')
const layoutForm = document.getElementById('layoutForm')
const buttonCloseModal = document.getElementById('buttonCloseModal')
const buttonAceptModal = document.getElementById('buttonAceptModal')
const buttonCancelModal = document.getElementById('buttonCancelModal')
const lockFieldIcons = document.querySelectorAll('.lock-field-icon')
const productsDescription = document.getElementById('description')
const fields = document.querySelectorAll('.field')
const quantity = document.getElementById('quantity')
const cost = document.getElementById('cost')
const sale = document.getElementById('sale')
const stock= document.getElementById('stock')
const boxes = document.getElementById('boxes')

let lastSaleID = 0
let newSaleID = 0
let intervalID = 0
let addedProductos = new Object()
let campos = {
    descripcion: false,
    cantidad: false
}
let productsData
let selectedProduct

function addOptions(selectField, dataset, key, optionDefault){
    selectField.innerHTML = ''
    selectField.appendChild(optionDefault)
    dataset.forEach(data => {
        const option = document.createElement('option')
        option.text = data[key]
        option.setAttribute('id', data.id)
        selectField.appendChild(option)
    });
}

function setTagID(){
    newSaleID = lastSaleID + 1
    let numberZeros = 9 - (`${newSaleID}`.length), tagNumber = "#"
    tagNumber = tagNumber.concat("0".repeat(numberZeros))
    tagNumber = tagNumber.concat(`${newSaleID}`)
    tagID.textContent = tagNumber
}

function getCurrentTime() {
    let date = new Date()
    let hour = date.getHours()
    let minutes = date.getMinutes()
    let seconds = date.getSeconds()
    
    hour = hour >= 0 && hour < 10 ? `0${hour}` : `${hour}`
    minutes = minutes >= 0 && minutes < 10 ? `0${minutes}` : `${minutes}`
    seconds = seconds >= 0 && seconds < 10 ? `0${seconds}` : `${seconds}`

    timeField.value = `${hour}:${minutes}:${seconds}`
}

function getCurrentDate() {
    let date = new Date()
    today = date.getDate()
    month = date.getMonth()
    year = date.getFullYear()

    today = today >= 1 && today < 10 ? `0${today}` : `${today}`
    month = month >= 0 && month < 10 ? `0${month + 1}` : `${month + 1}`
    dateField.value = `${year}-${month}-${today}`
}

function updateStockOnField(){
    let product = searchProductByIdAttribute()

    if (product != undefined) {
        let productStock = parseInt(product.stock)
        if(quantity.value <= 0){
            quantity.value = ''
        }

        productStock -= quantity.value
        stock.value = productStock
        verifyStock()
    }
}

function uptdateBoxesOnField(){
    let product = searchProductByIdAttribute()

    if (product != undefined) {
        let piecesInBox = parseInt(product.piecesInBox)
        if(quantity.value <= 0){
            quantity.value = ''
        }

        boxesComputed = Math.ceil(quantity.value / piecesInBox)
        boxes.value = boxesComputed
    }

}


function manageCheck(checkField, checked){
    if (checked) {
        checkField.readOnly = false

        if (checkField.id == 'time') {
            clearInterval(intervalID)
            intervalID = 0
            lockFieldIcons[1].classList.add('display-none')
        } else{
            lockFieldIcons[0].classList.add('display-none')
        }
    } else {
        checkField.readOnly = true

        if (checkField.id == 'time' && intervalID == 0) {
            intervalID = setInterval(() => {
                getCurrentTime()
            }, 1000);

            lockFieldIcons[1].classList.remove('display-none')
        } else {
            getCurrentDate()
            lockFieldIcons[0].classList.remove('display-none')
        }
    }
}

function searchProductByIdAttribute() {
    let productFounded
    
    productsData.forEach(product => {
        if (product.id == productsDescription.selectedIndex) {
            productFounded = product
        }
    })

    return productFounded
}

function verifyStock(){
    if (stock.value < 0) {
        quantity.value = ''

        product = searchProductByIdAttribute()
        stock.value = product.stock
    }
}

function setDataOnFields() {
    product = searchProductByIdAttribute()  
    cost.value = `$ ${product.cost}`
    sale.value = `$ ${product.sale}`
    stock.value = product.stock - quantity.value
    verifyStock()
    uptdateBoxesOnField()
}

function isEmptyForm(fields) {
    let isEmpty = true, index = 0
    
    
    while (fields[index] != undefined && isEmpty == true) {
        if (fields[index].type == "select-one") {
            isEmpty = fields[index].selectedIndex == 0
        } else {
            isEmpty = fields[index].value == ''
        }
        index++
    }

    return isEmpty
}

async function getEmployees(){
    const employeesData = await window.electronAPI.selectEmployees()
    const emptyOption = document.createElement('option')
    emptyOption.text = "Seleccione algún empleado"
    addOptions(employees, employeesData, "nombre", emptyOption)
}

async function getRoutes(){
    const routesData = await window.electronAPI.selectRoutes()
    const emptyOption = document.createElement('option')
    emptyOption.text = "Seleccione alguna ruta"
    addOptions(routes, routesData, "ruta", emptyOption)
}

async function getLastSaleID(){
    lastSaleID = await window.electronAPI.selectLastSaleID()
    setTagID()
}

async function getProducts(){
    productsData = await window.electronAPI.selectProducts()
    const emptyOption = document.createElement('option')
    emptyOption.text = "Seleccione algún producto"
    addOptions(productsDescription, productsData, "descrip", emptyOption)
}

dateCheck.addEventListener('click', () => {
    manageCheck(dateField, dateCheck.checked)
})

timeCheck.addEventListener('click', () => {
    manageCheck(timeField, timeCheck.checked)
})

buttonAddSale.addEventListener('click', async () => {
    layoutForm.classList.remove('display-none')
    modalForm.reset()
    await getProducts()
    productsDescription.focus()
})

productsDescription.addEventListener('change', () => {
    setDataOnFields()
})

quantity.addEventListener('keyup', () =>  {
    updateStockOnField()
    uptdateBoxesOnField()
})

buttonAceptModal.addEventListener('click', () => {
    let modalFormFields = []
    
    modalFormFields.push(fields[4])
    modalFormFields.push(fields[5])

    addedProductos[productsDescription.selectedIndex] = {
        Venta_FK__detalleventa: newSaleID,
        Producto_FK__detalleventa: productsDescription.selectedIndex,
        Cantidad_piezas_inicio__detalleventa: quantity.value,
        Precio_venta_al_momento__detalleventa: parseFloat(sale.value.replace('$', '').trim()),
        Precio_costo_al_momento__detalleventa: parseFloat(cost.value.replace('$', '').trim()),
    }

    console.log(addedProductos)
})

buttonCloseModal.addEventListener('click', () => {
    layoutForm.classList.add('display-none')
    delete addedProductos[productsDescription.selectedIndex]
    employees.focus()
})

buttonCancelModal.addEventListener('click', () => {
    layoutForm.classList.add('display-none')
    delete addedProductos[productsDescription.selectedIndex]
    employees.focus()
})

getEmployees()
getRoutes()
getLastSaleID()
manageCheck(dateField, dateCheck.checked)
manageCheck(timeField, timeCheck.checked)