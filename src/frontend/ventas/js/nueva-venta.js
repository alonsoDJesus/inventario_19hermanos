const employees = document.getElementById('employees')
const routes = document.getElementById('routes')
const tagID = document.querySelector('.form__tagnumber p')
const dateField = document.getElementById('date')
const timeField = document.getElementById('time')
const dateCheck = document.getElementById('checkDate')
const timeCheck = document.getElementById('checkTime')
const buttonAddSale = document.getElementById('buttonAddSale')
const modalForm = document.getElementById('modalForm')
const buttonCloseModal = document.getElementById('buttonCloseModal')
const buttonCancelModal = document.getElementById('buttonCancelModal')
const lockFieldIcons = document.querySelectorAll('.lock-field-icon')

let lastSaleID = 0
let intervalID = 0
let addedProductos = []
let campos = {
    descripcion: false,
    cantidad: false
}

function addOptions(selectField, dataset, key, optionDefault){
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


dateCheck.addEventListener('click', () => {
    manageCheck(dateField, dateCheck.checked)
})

timeCheck.addEventListener('click', () => {
    manageCheck(timeField, timeCheck.checked)
})

buttonAddSale.addEventListener('click', () => {
    modalForm.classList.remove('display-none')
})

buttonCloseModal.addEventListener('click', () => {
    modalForm.classList.add('display-none')
})

buttonCancelModal.addEventListener('click', () => {
    modalForm.classList.add('display-none')
})

getEmployees()
getRoutes()
getLastSaleID()
manageCheck(dateField, dateCheck.checked)
manageCheck(timeField, timeCheck.checked)