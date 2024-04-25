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
const buttonCancelModal = document.getElementById('buttonCancelModal')
const lockFieldIcons = document.querySelectorAll('.lock-field-icon')
const productsDescription = document.getElementById('description')
const fields = document.querySelectorAll('.field')
const quantityField = document.getElementById('quantity')

let lastSaleID = 0
let intervalID = 0
let addedProductos = new Object()
let campos = {
    descripcion: false,
    cantidad: false
}
let productsData

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
    lastSaleID += 1
    let numberZeros = 9 - (`${lastSaleID}`.length), tagNumber = "#"
    tagNumber = tagNumber.concat("0".repeat(numberZeros))
    tagNumber = tagNumber.concat(`${lastSaleID}`)
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

function setPricesOnFields() {
    const cost = document.getElementById('cost')
    const sale = document.getElementById('sale')

    productsData.forEach(product => {
        if (product.id == productsDescription.selectedIndex) {
            cost.value = `$ ${product.cost}`
            sale.value = `$ ${product.sale}`
        }
    })
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

function verifyToClose(){
    let modalFormFields = []
    modalFormFields.push(fields[4])
    modalFormFields.push(fields[5])
    
    if (!isEmptyForm(modalFormFields)){
        let response = confirm('¿Estas seguro de salir?\nLos datos se perderán!')
        if (response){
            layoutForm.classList.add('display-none')
        }
    }else{
        layoutForm.classList.add('display-none')
    }
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
})

productsDescription.addEventListener('change', () => {
    setPricesOnFields()
})

buttonCloseModal.addEventListener('click', () => {
    verifyToClose()
})

buttonCancelModal.addEventListener('click', () => {
    verifyToClose()
})

quantityField.addEventListener('keyup', () =>  {
    
})

getEmployees()
getRoutes()
getLastSaleID()
manageCheck(dateField, dateCheck.checked)
manageCheck(timeField, timeCheck.checked)