const employees = document.getElementById('employees')
const routes = document.getElementById('routes')
const dateField = document.getElementById('date')
const timeField = document.getElementById('time')
const lockFieldIcons = document.querySelectorAll('.lock-field-icon')
const productsDescription = document.getElementById('description')
const fields = document.querySelectorAll('.field')
const quantity = document.getElementById('quantity')
const cost = document.getElementById('cost')
const sale = document.getElementById('sale')
const stock= document.getElementById('stock')
const boxes = document.getElementById('boxes')
const code = document.getElementById('code')
const buttonOption1 = document.getElementById('buttonOption1')
const buttonOption2 = document.getElementById('buttonOption2')
const buttonShowOptions = document.getElementById('buttonShowOptions')
/*
    Objeto para los campos:
    - Almacena true si un campo tiene un dato correcto y un false si no lo tiene
*/

const fieldsCheck = {
    description: false,
    quantity: false,
    employees: false,
    routes: false,
    code: false
}

let saleID = 0
let intervalID = 0
let productsData

function getStatusValidationFields(){
    return fieldsCheck.employees && fieldsCheck.routes
}

function setSaleID(newSaleID){
    saleID = newSaleID
}

function getSaleID(){
    return saleID
}
//---------------------------------------------------Código a borrar
function sendSalesToStorage(sales, addedSale, index){
    sales[index] = addedSale
    const salesString = JSON.stringify(sales)
    sessionStorage.setItem("addedSales", salesString)
}

function setAddedSalesOnStorage(addedSale){
    const sessionStorageSales = sessionStorage.getItem("addedSales")
    
    if (sessionStorageSales) {
        // Recupera las ventas del session storage
        const auxAddedSales = JSON.parse(sessionStorageSales)
        let index = parseInt(sessionStorage.getItem("index"))
        index++
        sendSalesToStorage(auxAddedSales, addedSale, index)
        sessionStorage.setItem("index", `${index}`)

    } else {
        // Crea todo un objeto y establecelo en sessionStorage
        const transientSale = new Object()
        sessionStorage.setItem("index", "1")
        sendSalesToStorage(transientSale, addedSale, 1)
    }
}
//----------------------------------------------------------------------------

function setOptionsOnSelectField(selectField, dataset, keyName, optionDefault, selectedIndex){
    selectField.innerHTML = ''
    selectField.appendChild(optionDefault)
    dataset.forEach(data => {
        const option = document.createElement('option')
        option.text = data['codigo'] ? `${data['codigo']} ${data[keyName]}`: data[keyName]
        option.setAttribute('id', data.id)
        selectField.appendChild(option)
    });

    selectField.selectedIndex = selectedIndex
}

function setTagID(saleID){
    const tagID = document.querySelector('.form__tagnumber p')
    let numberZeros = 9 - (`${saleID}`.length), tagNumber = "#"

    if(numberZeros > 0){
        tagNumber = tagNumber.concat("0".repeat(numberZeros))
    }
    tagNumber = tagNumber.concat(`${saleID}`)
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


function switchModeTime(checkField, checked){
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

function searchProductByCode(code){
    let productFounded

    productsData.forEach(product => {
        if(product.codigo == code){
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
    stock.value = parseInt(product.stock)
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

            // Card Data
            const cardData = document.createElement('div')
            cardData.classList.add('card__data')

            // Elementos del data
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

            cardBody.appendChild(cardData) // La sección de datos se añade al contenido de la tarjeta

            // Card Buttons
            const cardButtons = document.createElement('div')
            cardButtons.classList.add('card__buttons')

            // <img src="${icons.up}" alt="" class="card_button">
            const edit = document.createElement('img')
            edit.src = `${icons.edit}`
            edit.classList.add('card__button')
            cardButtons.appendChild(edit)

            const trash = document.createElement('img')
            trash.src = `${icons.delete}`
            trash.classList.add('card__button')
            cardButtons.appendChild(trash)

            cardBody.appendChild(cardButtons) // La sección de botones se añade al contenido de la tarjeta

            card.appendChild(cardBody) // La sección de contenido en general es añadida la tarjeta como tal
            
            // La tarjeta es añadida al espacio de tarjetas
            containerSales.appendChild(card)
        }
    }
    
}

// Regulador de la cantidad ingresada por el usario
function regulateQuantity() {
    try {
        quantity.value = quantity.value.replace('-', '') // Evita numeros negativos
        if (fieldsCheck.description) {
            let product = searchProductByIdAttribute()

            if (parseInt(quantity.value) <= parseInt(product.stock) && quantity.value != '' && fieldsCheck.description) { // Si no excede al stock
                // Afecta las cantidades de stock disponible y de cajas a enviar
                stock.value = parseInt(product.stock) - parseInt(quantity.value)
                boxes.value = Math.ceil(parseInt(quantity.value) / parseInt(product.piecesInBox))

                // Señalizalo como correcto
                establecerCorrecto('quantity', quantity)
            } else { // Pero si excede al stock...
                clearDataFromFields(false)
                setDataOnFields() // Se restablecen los datos de los campos

                let errorMessage
                quantity.value == '' ? errorMessage = "Campo vacío" : errorMessage = "Stock superado"
                establecerIncorrecto('quantity', quantity, errorMessage)
            }
        }
    } catch (error) { // Si ocurre algun error, entonces
        if (error instanceof TypeError) {
            // sentencias para manejar excepciones TypeError
        }
    }
}

function searchRepeatedSale(addedSales){
    let mySale = undefined, index = 1
    
    while (addedSales[index] != undefined) {
        if (productsDescription.selectedIndex == addedSales[index].Producto_FK__detalleventa) {
            mySale = addedSales[index]
        }

        index++
    }

    return mySale
}

function setEmployeesField(employeesData, selectedIndex = 0){
    const emptyOption = document.createElement('option')
    emptyOption.text = "Seleccione algún empleado"
    setOptionsOnSelectField(employees, employeesData, "nombre", emptyOption, selectedIndex)
}

function setRoutesField(routesData, selectedIndex = 0) {
    const emptyOption = document.createElement('option')
    emptyOption.text = "Seleccione alguna ruta"
    setOptionsOnSelectField(routes, routesData, "ruta", emptyOption, selectedIndex)
}


function setProductsField(allProductsData, selectedIndex = 0){
    const emptyOption = document.createElement('option')
    emptyOption.text = "Seleccione algún producto"
    setOptionsOnSelectField(productsDescription, allProductsData, "descrip", emptyOption, selectedIndex)
}

function cancelSaleDetail(){
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

function setButtonsOptions(isReadOnly = false){
    
    if (!isReadOnly) {
        buttonOption1.children[0].src = icons.checkWhite
        buttonOption1.addEventListener('click', async () => {
            await saveSaleDetail()
        })

        buttonOption2.children[0].src = icons.xmarkWhite
        buttonOption2.addEventListener('click', () => {
            cancelSaleDetail()
        })
    }

    buttonShowOptions.onclick = function () {
        buttonOption1.classList.toggle('button_option1_active')
        buttonOption2.classList.toggle('button_option2_active')
    }
}

function toggleModalForm(openModal = true){
    const layoutForm = document.getElementById('layoutForm')
    const modalForm = document.getElementById('modalForm')

    layoutForm.classList.toggle('display-none') // Se muestra el modal
    modalForm.classList.toggle('display-none')
    
    if (openModal) {
        modalForm.reset() // Limpieza del formulario
    } else{
        employees.focus()
    }
}

function setSelectionFieldAsWrong(errorMessage){
    establecerIncorrecto('description', productsDescription, errorMessage) // Señalalo como incorrecto
    clearDataFromFields() // Limpia los datos de los campos
}

function checkProductRepetition(){
    const auxAddedSales = JSON.parse(sessionStorage.getItem("addedSales")) // Obtengo esos elementos
    const productRepeated = auxAddedSales != null ? searchRepeatedSale(auxAddedSales) : -1

    if ((productRepeated == undefined && auxAddedSales != null) || !auxAddedSales) { // Caso 1: Si hay intento de reptición de registro
        establecerCorrecto('description', productsDescription) // Señalalo como correcto
        clearDataFromFields()
        setDataOnFields()
    } else { // Caso 2: no hay intento de duplicación de registro
        setSelectionFieldAsWrong('Este producto ya está en tu lista de la venta')  // Señalalo como incorrecto
    }
}

function selectProductByCode(){
    if (fieldsCheck.code) {
        clearValidations('description', productsDescription)
        clearValidations('quantity', quantity)
        clearDataFromFields()

        productSearched = searchProductByCode(code.value)

        if(productSearched != undefined){
            productsDescription.selectedIndex = productSearched.id
            checkProductRepetition()
        }else{
            productsDescription.selectedIndex = 0
            establecerIncorrecto(code.name, code, 'Producto no encontrado')
        }
    }
}

async function getParams() {
    return await window.electronAPI.getFromSessionStorage("newSaleParams")
}

async function fetchEmployeesData(){
    const employeesData = await window.electronAPI.selectEmployees()
    return employeesData
}

async function fetchRoutesData(){
    const routesData = await window.electronAPI.selectRoutes()
    return routesData
}

async function fetchLastSaleID(){
    let lastSaleID = await window.electronAPI.selectLastSaleID()
    return lastSaleID
}

async function fetchProductsData(){
    const allProductsData = await window.electronAPI.selectProducts('code')
    return allProductsData
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
                    await window.electronAPI.deleteParams("newSaleParams")
                    sessionStorage.removeItem("index")
                    sessionStorage.removeItem("addedSales")
                    await goToSomewhere()
                }
                
                break;
         
            default:
                buttonOption1.classList.remove('button_save_active')
                buttonOption2.classList.remove('button_cancel_active')
                break;
          }
    })
}

async function saveSaleDetail(){
    const saleDetail = await window.electronAPI.getFromSessionStorage("addedSales")
    const statusValidation = getStatusValidationFields()

    if (saleDetail && statusValidation) {
        const saveSaleDetailTask = async function () {
            const newShift = {
                Ruta_FK__turno: routes.selectedIndex,
                Distribuidor_FK__turno: employees.selectedIndex
            }

            const shiftInsertID = await window.electronAPI.insertNewShift(newShift)

            if (typeof shiftInsertID == "number") {
                const newSaleWithShift = {
                    Venta_PK: saleID,
                    Fecha__venta: dateField.value,
                    Hora_inicio__venta: timeField.value,
                    Turno_FK__venta: shiftInsertID
                }

                const saleWithShiftInsertID = await window.electronAPI.insertNewSaleWithShift(newSaleWithShift)
                if (typeof saleWithShiftInsertID == "number") {
                    await window.electronAPI.insertSaleDetail(saleDetail)

                    await swal({
                        title: "Venta iniciada exitosamente",
                        button: {
                            text: 'Aceptar'
                        }
                    })

                    sessionStorage.removeItem("index")
                    sessionStorage.removeItem("addedSales")
                    await window.electronAPI.deleteParams("newSaleParams")
                    await window.electronAPI.navigateTo(links.home)
                }
            }
        }
        
        const confirmContent = {
            icon: 'warning',
            title: '¿Seguro que quieres guardar los datos?',
            text: 'Los datos que ingresaste deben ser correctos',
        }
    
        showSwalConfirm(undefined, confirmContent, saveSaleDetailTask)
    }else{
        const errorMessageForm = document.getElementById('errorMessageForm')
        errorMessageForm.classList.add('formulario__data-error')
        errorMessageForm.classList.remove('display-none')

        buttonOption1.classList.toggle('button_save_active')
        buttonOption2.classList.toggle('button_cancel_active')

        setTimeout(() => {
            errorMessageForm.classList.remove('formulario__data-error')
            errorMessageForm.classList.add('display-none')
        }, 5000);
    }
}

async function init() {
    const params = await getParams()
    const employeesData = await fetchEmployeesData()
    const routesData = await fetchRoutesData()

    switch (params.editingStatusOfNewSale) {
        case true:
            break;

        default:
            const checkTime = document.getElementById('checkTime')
            const checkDate = document.getElementById('checkDate')
            const buttonAddSale = document.getElementById('buttonAddSale')
            const buttonAceptModal = document.getElementById('buttonAceptModal')
            const buttonCloseModal = document.getElementById('buttonCloseModal')
            const buttonCancelModal = document.getElementById('buttonCancelModal')
            const buttonSearchProduct = document.getElementById('buttonSearchProduct')
            const imgButton = document.querySelector('#buttonSearchProduct img')
            const date = document.getElementById('date')
            const time = document.getElementById('time')
            const lastSaleID = await fetchLastSaleID()

            setSaleID(lastSaleID + 1)
            setTagID(getSaleID())
            setEmployeesField(employeesData)
            setRoutesField(routesData)
            switchModeTime(date, checkDate.checked)
            switchModeTime(time, checkTime.checked)
            renderAllSales()
            setButtonsOptions()

            checkDate.addEventListener('click', () => {
                switchModeTime(date, checkDate.checked)
            })

            checkTime.addEventListener('click', () => {
                switchModeTime(time, checkTime.checked)
            })

            // Clic para abrir el modal del registro para el nuevo producto
            buttonAddSale.addEventListener('click', async () => {
                const allProductsData = await fetchProductsData() // Colocación de productos en el select
                let modalFormFields = []

                toggleModalForm()

                productsData = allProductsData
                setProductsField(allProductsData)
                productsDescription.focus() // Cambia el enfoque al select de los productos

                // Limpieza de validaciones

                // En una lista se almacenan los campos que serán limpiados de sus validaciones
                modalFormFields.push(fields[4])
                modalFormFields.push(fields[5])
                modalFormFields.push(fields[6])
                modalFormFields.forEach(modalField => {
                    // De cada campo se necesita su nombre y el propio campo para su limpieza
                    clearValidations(modalField.name, modalField)
                })
            })

            buttonAceptModal.addEventListener('click', async () => {

                if (fieldsCheck.description && fieldsCheck.quantity) {
                    const addedSale = {
                        Venta_FK__detalleventa: saleID,
                        Producto_FK__detalleventa: productsDescription.selectedIndex,
                        Cantidad_piezas_inicio__detalleventa: quantity.value,
                        Precio_venta_al_momento__detalleventa: parseFloat(sale.value.replace('$', '').trim()),
                        Precio_costo_al_momento__detalleventa: parseFloat(cost.value.replace('$', '').trim()),
                        description: productsDescription.value,
                        quantityBoxes: boxes.value
                    }

                    //setAddedSalesOnStorage(addedSale)

                    // Inserción de la venta en Session Storage
                    const saleDetail = await window.electronAPI.prepareSaleDetailOnSessionStorage() // Se preparan los datos para insercion
                    saleDetail.newAddedSale = addedSale // Se añade el objeto del nuevo producto a registrar
                    await window.electronAPI.setSaleDetailOnSessionStorage(saleDetail.objectSales, saleDetail.newAddedSale, saleDetail.i) // Se almacenan los datos

                    toggleModalForm(false)
                    renderAllSales()
                }
            })

            buttonCloseModal.addEventListener('click', () => {
                toggleModalForm(false)
            })

            buttonCancelModal.addEventListener('click', () => {
                toggleModalForm(false)
            })

            employees.addEventListener('change', () => {
                employees.selectedIndex != 0 ? establecerCorrecto('employees', employees) : establecerIncorrecto('employees', employees, 'Selecciona un empleado');
            })

            routes.addEventListener('change', () => {
                routes.selectedIndex != 0 ? establecerCorrecto('routes', routes) : establecerIncorrecto('routes', routes, 'Selecciona una ruta');
            })

            // Clic para seleccionar algun producto
            productsDescription.addEventListener('change', () => {
                clearValidations(fields[5].name, fields[5])
                clearValidations(fields[6].name, fields[6])
                // Si no está seleccionado ningun producto
                if (productsDescription.selectedIndex == 0) {
                    setSelectionFieldAsWrong('Seleccione un producto válido') // Señalalo como incorrecto
                } else { // Si ha sido seleccionado algún producto, entonces...
                    checkProductRepetition()
                }

                productSelected = searchProductByIdAttribute()
                code.value = productSelected.codigo
                clearValidations(code.name, code)
                
            });

            // Cada vez que el usuario escriba una cantidad
            quantity.addEventListener('keyup', () => {
                regulateQuantity() // Regulala en funcion del stock
            })

            // Cada vez que cambia la cantidad por medio de los botones del campo
            quantity.addEventListener('change', () => {
                regulateQuantity()
            })

            code.addEventListener('keyup', (e) => {
                if(e.code == 'NumpadEnter' || e.code == 'Enter'){
                    selectProductByCode()
                }else{
                    const checkValue = window.electronAPI.testByRegexp(code.value, 'codeProduct')

                    if (checkValue) {
                        clearValidations(code.name, code)
                        fieldsCheck.code = true
                    } else {
                        fieldsCheck.code = false
                        productsDescription.selectedIndex = 0

                        let errorMessage = ''
                        if (code.value.length == 0) {
                            errorMessage = 'Campo Vacío'    
                        }else if(code.value.length > 10){
                            errorMessage = 'Código muy largo' 
                        }else{
                            errorMessage = 'Símbolos raros' 
                        }

                        establecerIncorrecto(code.name, code, errorMessage)
                    }
                }

            })

            buttonSearchProduct.addEventListener('click', () => {
                selectProductByCode()
            })

            buttonSearchProduct.addEventListener('mouseenter', () => {
                imgButton.src = icons.searchPrimary
            })

            buttonSearchProduct.addEventListener('mouseleave', () => {
                imgButton.src = icons.searchWhite
            })

            break;

    }
}

window.addEventListener('load', () => {
    const navHome = document.getElementById('navHome')
    const navNewSale = document.getElementById('navNewSale')
    const navCompletedSales = document.getElementById('navCompletedSales')
    const navStock = document.getElementById('navStock')    

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
})

init()