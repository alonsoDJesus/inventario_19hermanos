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
const buttonSave = document.getElementById('buttonSave')
const buttonCancel = document.getElementById('buttonCancel')
const buttonShowOptions = document.getElementById('buttonShowOptions')

let lastSaleID = 0
let newSaleID = 0
let intervalID = 0
let addedProductos = new Object()
let addedProductosString = ""
let productsData
let selectedProduct

/*
    Objeto para los campos:
    - Almacena true si un campo tiene un dato correcto y un false si no lo tiene
*/

const fieldsCheck = {
    description: false,
    quantity: false,
    employees: false
}


function sendSalesToStorage(sales, addedSale, index){
    sales[index] = addedSale
    const salesString = JSON.stringify(sales)
    sessionStorage.setItem("addedSales", salesString)
}

function setAddedSalesOnStorage(addedSale){
    if (sessionStorage.length != 0) {
        // Recuperalos del session storage
        const auxAddedSales = JSON.parse(sessionStorage.getItem("addedSales"))
        let index = parseInt(sessionStorage.getItem("index"))
        index++
        sendSalesToStorage(auxAddedSales, addedSale, index)
        sessionStorage.setItem("index", `${index}`)
        // auxAddedSales[productsDescription.selectedIndex] = addedSale

        // const auxAddedSalesString = JSON.stringify(auxAddedSales)
        // sessionStorage.setItem("addedSales", auxAddedSalesString)

    } else {
        // Crea todo un objeto y establecelo en sessionStorage
        const transientSale = new Object()
        sessionStorage.setItem("index", "1")
        sendSalesToStorage(transientSale, addedSale, 1)
        // transientSale[productsDescription.selectedIndex] = addedSale
        
        // const transientSaleString = JSON.stringify(transientSale)
        // sessionStorage.setItem("addedSales", transientSaleString)
    }
}

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
    stock.value = product.stock
}

// Limppieza de datos de los campos
function clearDataFromFields(wantToCleanQuantity = true){
    cost.value = ''
    sale.value = ''
    stock.value = ''
    boxes.value = ''
    quantity.value = wantToCleanQuantity ? '' : quantity.value
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

// Limpieza de validaciones
function clearValidations(nameField, field){
    // Se ocultan los íconos
    document.getElementById(`${nameField}__val`).classList.remove('opacity-1');
    document.getElementById(`${nameField}__val`).classList.add('opacity-0');

    // Se eliminan los íconos de correcto o incorrecto
    document.getElementById(`${nameField}__val`).classList.remove('icon-wrong');
    document.getElementById(`${nameField}__val`).classList.remove('icon-check');

    // Se eliminan mensajes de error
    field.parentNode.children[`${nameField}__warning`].classList.remove('formulario__input-error-activo')

    fieldsCheck[nameField] = false; // En el objeto de los campos se señala una entrada incorrecta
}

function renderAllSales() {
    if (sessionStorage.getItem("addedSales")) {
        const auxAddedSales = JSON.parse(sessionStorage.getItem("addedSales"))
        const containerSales = document.getElementById('logCards')
        let indexChild = containerSales.childNodes.length - 1

        while (indexChild != 2) {
            containerSales.removeChild(containerSales.childNodes[indexChild])
            indexChild--
        }

        for (let index = Object.keys(auxAddedSales).length; index > 0; index--) {
            // Card
            const card = document.createElement('div')
            card.classList.add('card')

            // Card body
            const cardBody = document.createElement('div')
            cardBody.classList.add('card__body')
            card.appendChild(cardBody)

            // Card Data
            const cardData = document.createElement('div')
            cardData.classList.add('card__data')

            const paragraphDescription = document.createElement('p')
            paragraphDescription.classList.add('data')
            paragraphDescription.classList.add('data_description')
            paragraphDescription.innerText = `${auxAddedSales[index].description}`
            cardData.appendChild(paragraphDescription)

            const paragraphPieces = document.createElement('p')
            paragraphPieces.classList.add('data')
            paragraphPieces.classList.add('data_pieces')
            paragraphPieces.classList.add('number')
            paragraphPieces.innerText = `${auxAddedSales[index]['Cantidad_piezas_inicio__detalleventa']}`
            cardData.appendChild(paragraphPieces)

            const paragraphBoxes = document.createElement('p')
            paragraphBoxes.classList.add('data')
            paragraphBoxes.classList.add('data_boxes')
            paragraphBoxes.classList.add('number')
            paragraphBoxes.innerText = `${auxAddedSales[index].quantityBoxes}`
            cardData.appendChild(paragraphBoxes)

            cardBody.appendChild(cardData)

            // Card Buttons
            const cardButtons = document.createElement('div')
            cardButtons.classList.add('card__buttons')
            cardBody.appendChild(cardButtons)

            // Se crea la tarjeta
            containerSales.appendChild(card)
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

async function getProducts(){
    productsData = await window.electronAPI.selectProducts()
    const emptyOption = document.createElement('option')
    emptyOption.text = "Seleccione algún producto"
    addOptions(productsDescription, productsData, "descrip", emptyOption)
}

buttonShowOptions.onclick = function () {
    buttonSave.classList.toggle('button_save_active')
    buttonCancel.classList.toggle('button_cancel_active')
}

dateCheck.addEventListener('click', () => {
    manageCheck(dateField, dateCheck.checked)
})

timeCheck.addEventListener('click', () => {
    manageCheck(timeField, timeCheck.checked)
})

// Clic para abrir el modal del registro para el nuevo producto
buttonAddSale.addEventListener('click', async () => {
    layoutForm.classList.remove('display-none') // Se muestra el modal
    modalForm.reset() // Limpieza del formulario
    await getProducts() // Colocación de productos en el select
    productsDescription.focus() // Cambia el enfoque al select de los productos

    // Limpieza de validaciones

    let modalFormFields = []
    
    // En una lista se almacenan los campos que serán limpiados de sus validaciones
    modalFormFields.push(fields[4])
    modalFormFields.push(fields[5])

    modalFormFields.forEach(modalField => {
        // De cada campo se necesita su nombre y el propio campo para su limpieza
        clearValidations(modalField.name, modalField)
    })
})

buttonAceptModal.addEventListener('click', () => {
    
    if (fieldsCheck.description && fieldsCheck.quantity) {
        const addedSale = {
            Venta_FK__detalleventa: newSaleID,
            Producto_FK__detalleventa: productsDescription.selectedIndex,
            Cantidad_piezas_inicio__detalleventa: quantity.value,
            Precio_venta_al_momento__detalleventa: parseFloat(sale.value.replace('$', '').trim()),
            Precio_costo_al_momento__detalleventa: parseFloat(cost.value.replace('$', '').trim()),
            description: productsDescription.value,
            quantityBoxes: boxes.value
        }
        setAddedSalesOnStorage(addedSale)
        layoutForm.classList.add('display-none')
        employees.focus()
        renderAllSales()
    }
})

buttonCloseModal.addEventListener('click', () => {
    layoutForm.classList.add('display-none')
    employees.focus()
})

buttonCancelModal.addEventListener('click', () => {
    layoutForm.classList.add('display-none')
    employees.focus()
})

getEmployees()
getRoutes()
getLastSaleID()
manageCheck(dateField, dateCheck.checked)
manageCheck(timeField, timeCheck.checked)
renderAllSales()
