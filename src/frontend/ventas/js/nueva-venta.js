const employees = document.getElementById('employees')
const routes = document.getElementById('routes')
const tagID = document.querySelector('.form__tagnumber p')
const dateField = document.getElementById('date')
const timeField = document.getElementById('time')
const dateCheck = document.getElementById('checkDate')
const timeCheck = document.getElementById('checkTime')

let lastSaleID = 0

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

function manageCheck(checkField, checked){
    if (checked) {
        checkField.disabled = false
    } else {
        checkField.disabled = true
    }
}

dateCheck.addEventListener('click', () => {
    manageCheck(dateField, dateCheck.checked)
})

timeCheck.addEventListener('click', () => {
    manageCheck(timeField, timeCheck.checked)
})

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

getEmployees()
getRoutes()
getLastSaleID()
manageCheck(dateField, dateCheck.checked)
manageCheck(timeField, timeCheck.checked)