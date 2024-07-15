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
const code = document.getElementById('code')
const buttonOption1 = document.getElementById('buttonOption1')
const buttonOption2 = document.getElementById('buttonOption2')
const buttonShowOptions = document.getElementById('buttonShowOptions')
const initialQuantityBoxes = document.getElementById('initialQuantityBoxes')
const buttonAceptModal = document.getElementById('buttonAceptModal')
const saleIconLock = document.getElementById('saleIconLock')

let routesData = []
/*
    Objeto para los campos:
    - Almacena true si un campo tiene un dato correcto y un false si no lo tiene
*/

const fieldsCheck = {
    description: false,
    quantity: false,
    employees: false,
    routes: false,
    code: false,
    initialQuantityBoxes: false,
    date: false,
    sale: false
}

let saleID = 0
let intervalID = 0
let productsData
let editingStatusModalForm = false
let editingStatusForm
let productIdToEdit
let productToEdit
let isProductRepeated = false
let saleInitiatedData

function getStatusValidationFields(){
    if (!fieldsCheck.employees){
        establecerIncorrecto(employees.name, employees, "Selecciona un empleado")
    }

    if (!fieldsCheck.routes){
        establecerIncorrecto(routes.name, routes, "Selecciona una ruta")
    }

    if(!fieldsCheck.initialQuantityBoxes){
        validateNumbers('intNumbers', initialQuantityBoxes)
    }

    if(!fieldsCheck.date){
        validateDate()
    }

    return fieldsCheck.employees && fieldsCheck.routes && fieldsCheck.initialQuantityBoxes && fieldsCheck.date
}

function setSaleID(newSaleID){
    saleID = newSaleID
}

function getSaleID(){
    return saleID
}
//---------------------------------------------------Código a borrar
// function sendSalesToStorage(sales, addedSale, index){
//     sales[index] = addedSale
//     const salesString = JSON.stringify(sales)
//     sessionStorage.setItem("addedSales", salesString)
// }

// function setAddedSalesOnStorage(addedSale){
//     const sessionStorageSales = sessionStorage.getItem("addedSales")

//     if (sessionStorageSales) {
//         // Recupera las ventas del session storage
//         const auxAddedSales = JSON.parse(sessionStorageSales)
//         let index = parseInt(sessionStorage.getItem("index"))
//         index++
//         sendSalesToStorage(auxAddedSales, addedSale, index)
//         sessionStorage.setItem("index", `${index}`)

//     } else {
//         // Crea todo un objeto y establecelo en sessionStorage
//         const transientSale = new Object()
//         sessionStorage.setItem("index", "1")
//         sendSalesToStorage(transientSale, addedSale, 1)
//     }
// }
//----------------------------------------------------------------------------

function setOptionsOnSelectField(selectField, dataset, keyName, optionDefault, selectedIndex){
    selectField.innerHTML = ''
    selectField.appendChild(optionDefault)
    dataset.forEach(data => {
        const option = document.createElement('option')
        option.text = selectField.id == 'routes' ? data['codigo'] : data[keyName]
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

function getCurrentDate() {
    let date = new Date()
    today = date.getDate()
    month = date.getMonth()
    year = date.getFullYear()

    today = today >= 1 && today < 10 ? `0${today}` : `${today}`
    month = month >= 0 && month < 10 ? `0${month + 1}` : `${month + 1}`
    dateField.value = `${year}-${month}-${today}`
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

function searchRouteByIdAttribute() {
    let routeFounded

    routesData.forEach(route => {
        if (route.id == routes.selectedIndex) {
            routeFounded = route
        }
    })

    return routeFounded
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

function searchRouteByCode(code){
    let routeFounded

    routesData.forEach(route => {
        if(route.codigo == code){
            routeFounded = route
        }
    })

    return routeFounded
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
    fieldsCheck.sale = true
}

// Limppieza de datos de los campos
function clearDataFromFields(wantToCleanQuantity = true){
    cost.value = ''
    sale.value = ''
    stock.value = ''
    quantity.value = wantToCleanQuantity ? '' : quantity.value
}

async function prepareModalForm(productData = undefined) {
    const allProductsData = await fetchProductsData() // Colocación de productos en el select
    const title = document.querySelector('.form__addsale h2')
    productsData = allProductsData

    if (productData != undefined) {
        editingStatusModalForm = true

        title.innerText = "Edita este producto"
        setProductsField(allProductsData, productData.Producto_FK__detalleventa)

        code.value = productData.code

        establecerCorrecto('description', productsDescription) // Señalalo como correcto
        clearDataFromFields()
        setDataOnFields()
        quantity.value = productData.Cantidad_piezas_inicio__detalleventa
        regulateQuantity()

        sale.value = `$ ${productData.Precio_venta_al_momento__detalleventa}`
    } else{
        editingStatusModalForm = false

        title.innerText = "Agrega un producto"
        setProductsField(allProductsData)
    }
    code.focus() // Cambia el enfoque al select de los productos
}

// function isEmptyForm(fields) {
//     let isEmpty = true, index = 0


//     while (fields[index] != undefined && isEmpty == true) {
//         if (fields[index].type == "select-one") {
//             isEmpty = fields[index].selectedIndex == 0
//         } else {
//             isEmpty = fields[index].value == ''
//         }
//         index++
//     }

//     return isEmpty
// }

// Limpieza de validaciones
// function clearValidations(nameField, field){
//     // Se ocultan los íconos
//     document.getElementById(`${nameField}__val`).classList.remove('opacity-1');
//     document.getElementById(`${nameField}__val`).classList.add('opacity-0');

//     // Se eliminan los íconos de correcto o incorrecto
//     document.getElementById(`${nameField}__val`).classList.remove('icon-wrong');
//     document.getElementById(`${nameField}__val`).classList.remove('icon-check');

//     // Se eliminan mensajes de error
//     field.parentNode.children[`${nameField}__warning`].classList.remove('formulario__input-error-activo')

//     fieldsCheck[nameField] = false; // En el objeto de los campos se señala una entrada incorrecta
// }

function renderAllSales() {
    if (sessionStorage.getItem("addedSales")) {
        const auxAddedSales = JSON.parse(sessionStorage.getItem("addedSales"))
        const containerSales = document.getElementById('logCards')
        let indexChild = containerSales.childNodes.length - 1

        while (indexChild != 2) {
            containerSales.removeChild(containerSales.childNodes[indexChild])
            indexChild--
        }
        
        for (let index = 1; index <= Object.keys(auxAddedSales).length; index++) {
            // Card
            const card = document.createElement('div')
            card.classList.add('card')
            card.id = auxAddedSales[index].Producto_FK__detalleventa

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

            cardBody.appendChild(cardData) // La sección de datos se añade al contenido de la tarjeta

            // Card Buttons
            const cardButtons = document.createElement('div')
            cardButtons.classList.add('card__buttons')

            const cardButtonsSources = [icons.edit, icons.delete]

            cardButtonsSources.forEach( (source) => {
                const cardButton = document.createElement('div')
                cardButton.classList.add('card__button')

                    const cardButtonImage = document.createElement('img')
                    cardButtonImage.src = source
                    cardButtonImage.classList.add('h-1rem')
                
                cardButton.onclick = source == icons.edit ? (event) => editProductSale(event.target.closest('.card__button').id) : deleteProductSale
                cardButton.id = index
                source == icons.delete ? cardButton.name = 'buttonDeleteProduct' : cardButton.name = 'buttonEditProduct'
                cardButton.appendChild(cardButtonImage)               
                cardButtons.appendChild(cardButton)
            })

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
            
            if (parseInt(quantity.value) <= parseInt(product.stock) && quantity.value != '' && parseInt(quantity.value) != 0) { // Si no excede al stock
                // Afecta las cantidades de stock disponible y de cajas a enviar
                
                stock.value = parseInt(product.stock) - parseInt(quantity.value)

                // Señalizalo como correcto
                establecerCorrecto('quantity', quantity)
            } else { // Pero si excede al stock...
                clearDataFromFields(false)
                setDataOnFields() // Se restablecen los datos de los campos

                let errorMessage
                quantity.value == '' ? errorMessage = "Campo Vacío" : (parseInt(quantity.value) == 0 ? errorMessage = "No se acepta 0" : errorMessage = "Stock superado")
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
    emptyOption.disabled = true
    emptyOption.selected = true
    setOptionsOnSelectField(employees, employeesData, "nombre", emptyOption, selectedIndex)
}

function setRoutesField(routesData, selectedIndex = 0) {
    const emptyOption = document.createElement('option')
    emptyOption.text = "Seleccione alguna ruta"
    emptyOption.disabled = true
    emptyOption.selected = true
    setOptionsOnSelectField(routes, routesData, "ruta", emptyOption, selectedIndex)
}


function setProductsField(allProductsData, selectedIndex = 0){
    const emptyOption = document.createElement('option')
    emptyOption.text = "Seleccione algún producto"
    emptyOption.disabled = true
    emptyOption.selected = true
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

function setButtonsOptions(statusOfNewSale = 'create') {

    buttonOption1.children[0].src = icons.checkWhite
    buttonOption1.addEventListener('click', async () => {
        await saveSaleDetail()
    })

    buttonOption2.children[0].src = icons.xmarkWhite
    buttonOption2.addEventListener('click', () => {
        cancelSaleDetail()
    })

    buttonShowOptions.onclick = function () {
        buttonOption1.classList.toggle('button_option1_active')
        buttonOption2.classList.toggle('button_option2_active')
    }
}

function toggleModalForm(openModal = true) {
    const layoutForm = document.getElementById('layoutForm')
    const modalForm = document.getElementById('modalForm')
    let modalFormFields = []

    layoutForm.classList.toggle('display-none') // Se muestra el modal
    modalForm.classList.toggle('display-none')

    if (openModal) {
        modalForm.reset() // Limpieza del formulario
        // Limpieza de validaciones

        sale.readOnly = true
        saleIconLock.src = icons.lockIcon

        // En una lista se almacenan los campos que serán limpiados de sus validaciones
        modalFormFields.push(fields[4])
        modalFormFields.push(fields[5])
        modalFormFields.push(fields[6])
        modalFormFields.push(fields[9])
        modalFormFields.forEach(modalField => {
            // De cada campo se necesita su nombre y el propio campo para su limpieza
            clearValidations(modalField.name, modalField)
        })


    } else {
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

    if ((productRepeated == undefined && auxAddedSales != null) || !auxAddedSales || (editingStatusModalForm && productRepeated.Producto_FK__detalleventa == productToEdit.Producto_FK__detalleventa)) { // Caso 1: Si hay intento de reptición de registro
        isProductRepeated = false
        establecerCorrecto('description', productsDescription) // Señalalo como correcto
        clearDataFromFields()
        setDataOnFields()
    } else { // Caso 2: no hay intento de duplicación de registro
        isProductRepeated = true
        setSelectionFieldAsWrong('Este producto ya está en tu lista de la venta')  // Señalalo como incorrecto
    }
}

function selectProductByCode(){
    if (fieldsCheck.code) {
        clearValidations('description', productsDescription)
        clearValidations('quantity', quantity)
        ocultarMensajeCaution(sale.name, sale)
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

function validateDate(){
    if(dateField.value != ''){
        const dateRegistered = new Date(dateField.value)
        year = dateRegistered.getFullYear()
        year >= 2024 && year < 2500 ? establecerCorrecto('date', dateField) : establecerIncorrecto('date', dateField, 'Fecha Incorrecta')
    }
}

async function validateNumbers(typeNumbers = 'intNumbers', field) {    
    if (field.value == "") {
        establecerIncorrecto(field.name, field, 'Campo Vacío')
        return
    }

    if (field.value == 0){
        establecerIncorrecto(field.name, field, 'Valor no válido')
        return
    }

    const testByRegExp = await window.electronAPI.testByRegexp(field.value, typeNumbers)
    if(!testByRegExp){
        establecerIncorrecto(field.name, field, 'Símbolos o números raros')
        return
    }

    if(field.name == 'sale'){
        if(parseFloat(sale.value.replace('$', '').trim()) <=  parseFloat(cost.value.replace('$', '').trim())){
            establecerIncorrecto(field.name, field, 'Precio Incorrecto')
            return
        }
    }

    establecerCorrecto(field.name, field)
}

async function editProductSale(id){
    productIdToEdit = id
    const addedSales = await window.electronAPI.getFromSessionStorage("addedSales")
    productToEdit = addedSales[productIdToEdit]

    toggleModalForm()
    prepareModalForm(productToEdit, productIdToEdit)
}

async function deleteProductSale(event) {
    await swal({
        icon: 'warning',
        title: '¿Estás seguro de eliminar el producto?',
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
        if (value) {
            productIdToEdit = event.target.closest('.card__button').id
            const addedSales = await window.electronAPI.getFromSessionStorage("addedSales")
            productToEdit = addedSales[productIdToEdit]

            if (editingStatusForm) {
                const currentDeletedProducts = await window.electronAPI.getFromSessionStorage("deletedSales")
                const deleteDetail = await window.electronAPI.prepareSessionStorage("deletedSalesIndex", currentDeletedProducts)
                deleteDetail.objectSales[deleteDetail.i] = productToEdit
                await window.electronAPI.setItemsOnSessionStorage("deletedSales", deleteDetail.objectSales)
            }

            delete addedSales[productIdToEdit]
            const auxAddedSales = Object.values(addedSales)

            let updatedAddedSales = {}
            auxAddedSales.forEach((addedSale, index) => {
                updatedAddedSales[index + 1] = addedSale
            })

            await window.electronAPI.setItemsOnSessionStorage("addedSales", updatedAddedSales)
            renderAllSales()

            if (auxAddedSales.length == 0) {
                sessionStorage.removeItem("addedSales")
                sessionStorage.removeItem("addedSalesIndex")
            }
        }
    })
}

async function setInitiatedSaleDetailOnSessionStorage({saleId: saleId, productId: productId, quantityOfPieces: quantityOfPieces, salePrice: salePrice, costPrice: costPrice, description: description, productCode: code, originalId: originalId}) {
    
    const addedSale = {
        Venta_FK__detalleventa: saleId,
        Producto_FK__detalleventa: productId,
        Cantidad_piezas_inicio__detalleventa: quantityOfPieces,
        Precio_venta_al_momento__detalleventa: salePrice,
        Precio_costo_al_momento__detalleventa: costPrice,
        description: description,
        code: code
    }

    if (originalId != undefined) {
        addedSale.oldId = originalId
    }

    // Inserción de la venta en Session Storage
    const currentAddedSales = await window.electronAPI.getFromSessionStorage("addedSales")
    const saleDetail = await window.electronAPI.prepareSessionStorage("addedSalesIndex", currentAddedSales) // Se preparan los datos para insercion
    saleDetail.objectSales[saleDetail.i] = addedSale // Se añade el objeto del nuevo producto a registrar
    await window.electronAPI.setItemsOnSessionStorage("addedSales", saleDetail.objectSales) // Se almacenan los datos

    //setAddedSalesOnStorage(addedSale)
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
    const allProductsData = await window.electronAPI.selectAvailableStocks(saleID)
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
                    sessionStorage.removeItem("addedSalesIndex")
                    sessionStorage.removeItem("addedSales")
                    sessionStorage.removeItem("deletedSales")
                    sessionStorage.removeItem("deletedSalesIndex")
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
            const shiftData = {
                Ruta_FK__turno: routes.selectedIndex,
                Distribuidor_FK__turno: employees.selectedIndex
            }

            const existentShiftId = editingStatusForm ? saleInitiatedData.turnoId : -1
            let shiftInsertID = await window.electronAPI.saveShift(shiftData, existentShiftId)

            if (typeof shiftInsertID == "number") {
                const saleData = {
                    Venta_PK: saleID,
                    Fecha_inicio__venta: dateField.value,
                    Turno_FK__venta: editingStatusForm ? saleInitiatedData.turnoId : shiftInsertID,
                    Cajas_inicio__venta: parseInt(initialQuantityBoxes.value)
                }
                
                const saleDataInsertedID = await window.electronAPI.saveSaleWithShift(saleData, !editingStatusForm)

                if (typeof saleDataInsertedID == "number") {
                    const statusSaleDetailInsertion = await window.electronAPI.saveSaleDetail(saleDetail, !editingStatusForm)
                    
                    if (statusSaleDetailInsertion == 1) {
                        
                        let currentDeletedSales = window.electronAPI.getFromSessionStorage("deletedSales")

                        if (currentDeletedSales && editingStatusForm) {
                            currentDeletedSales = Object.values(currentDeletedSales)
                            
                            
                            for (let index = 0; index < currentDeletedSales.length; index++) {
                                if (currentDeletedSales[index].oldId) {
                                    await window.electronAPI.deleteProductFromSaleDetail(currentDeletedSales[index].Venta_FK__detalleventa, currentDeletedSales[index].Producto_FK__detalleventa)
                                }                                    
                            }
                        }

                        await swal({
                            title: editingStatusForm ? "Venta editada exitosamente" : "Venta iniciada exitosamente",
                            button: {
                                text: 'Aceptar'
                            }
                        })
    
                        sessionStorage.removeItem("addedSalesIndex")
                        sessionStorage.removeItem("addedSales")
                        sessionStorage.removeItem("deletedSales")
                        sessionStorage.removeItem("deletedSalesIndex")
                        await window.electronAPI.deleteParams("newSaleParams")
                        await window.electronAPI.navigateTo(links.home)
                    }
                }
            }
        }

        const confirmContent = {
            icon: 'warning',
            title: '¿Seguro que quieres guardar los datos?',
            text: 'Los datos que ingresaste deben ser correctos',
        }

        showSwalConfirm(undefined, confirmContent, saveSaleDetailTask)
    } else {
        if (!saleDetail) {
            const errorMessageForm = document.getElementById('errorMessageForm')
            errorMessageForm.classList.add('formulario__data-error')
            errorMessageForm.classList.remove('display-none')

            buttonOption1.classList.toggle('button_save_active')
            buttonOption2.classList.toggle('button_cancel_active')
        }
    }
}

async function init() {
    const params = await getParams()
    const buttonAddSale = document.getElementById('buttonAddSale')
    const buttonCloseModal = document.getElementById('buttonCloseModal')
    const buttonCancelModal = document.getElementById('buttonCancelModal')
    const buttonSearchProduct = document.getElementById('buttonSearchProduct')
    const imgButton = document.querySelector('#buttonSearchProduct img')
    const date = document.getElementById('date')
    const checkDate = document.getElementById('checkDate')
    const employeesData = await fetchEmployeesData()
    const logCards = document.getElementById('logCards')

    routesData = await fetchRoutesData()

    setEmployeesField(employeesData)
    setRoutesField(routesData)

    switch (params.statusOfNewSale) {
        case 'edit':
            const title = document.querySelector('h1')
            saleInitiatedData = await window.electronAPI.selectInitiatedSaleById(params.saleId)
            const initiatedSaleDetailData = await window.electronAPI.selectInitiatedSaleDetailById(params.saleId)
            editingStatusForm = true

            title.innerText = "Editar Ruta"

            setSaleID(params.saleId)
            setTagID(getSaleID())

            employees.selectedIndex = saleInitiatedData.vendedorId
            initialQuantityBoxes.value = saleInitiatedData.cantidadCajas
            routes.selectedIndex = saleInitiatedData.rutaId
            dateField.value = saleInitiatedData.fechaInicio
            establecerCorrecto(employees.name, employees)
            establecerCorrecto(initialQuantityBoxes.name, initialQuantityBoxes)
            establecerCorrecto(routes.name, routes)

            if(await window.electronAPI.getFromSessionStorage("addedSales") == null){
                for (let index = 0; index < initiatedSaleDetailData.length; index++) {
                    const saleDetailFounded = initiatedSaleDetailData[index];
                    await setInitiatedSaleDetailOnSessionStorage({
                        saleId: parseInt(saleID),
                        productId: saleDetailFounded.idProducto,
                        productCode: saleDetailFounded.codigo,
                        quantityOfPieces: saleDetailFounded.piezasEntregadas,
                        salePrice: parseFloat(saleDetailFounded.precioVenta),
                        costPrice: parseFloat(saleDetailFounded.precioCosto),
                        description: saleDetailFounded.descripcion,
                        originalId: saleDetailFounded.idProducto
                    })
                }
            }

            renderAllSales()
            setButtonsOptions('edit')
            break;

        default:
            const lastSaleID = await fetchLastSaleID()
            editingStatusForm = false

            getCurrentDate()

            setSaleID(lastSaleID + 1)
            setTagID(getSaleID())
            renderAllSales()
            setButtonsOptions()
            break;

    }

    validateDate()

    buttonAceptModal.addEventListener('click', async () => {
        if (fieldsCheck.description && fieldsCheck.quantity) {
            switch (editingStatusModalForm) {
                case true:
                    productToEdit.Producto_FK__detalleventa = productsDescription.selectedIndex
                    productToEdit.code = code.value
                    productToEdit.Cantidad_piezas_inicio__detalleventa = quantity.value
                    productToEdit.Precio_venta_al_momento__detalleventa = parseFloat(sale.value.replace('$', '').trim())
                    productToEdit.Precio_costo_al_momento__detalleventa = parseFloat(cost.value.replace('$', '').trim())
                    productToEdit.description = productsDescription.value

                    const addedSales = await window.electronAPI.getFromSessionStorage("addedSales")
                    addedSales[productIdToEdit] = productToEdit
                    await window.electronAPI.setItemsOnSessionStorage("addedSales", addedSales)
                    break;

                default:

                    await setInitiatedSaleDetailOnSessionStorage({
                        saleId: saleID,
                        productId: productsDescription.selectedIndex,
                        productCode: code.value,
                        quantityOfPieces: quantity.value,
                        salePrice: parseFloat(sale.value.replace('$', '').trim()),
                        costPrice: parseFloat(cost.value.replace('$', '').trim()),
                        description: productsDescription.value,
                    })

                    

                    break;
            }

            toggleModalForm(false)
            renderAllSales()
        }else{
            if(productsDescription.selectedIndex == 0){
                establecerIncorrecto('description', productsDescription, 'Seleccione un producto válido')
            }
            
            if(quantity.value == ""){
                establecerIncorrecto('quantity', quantity, "Campo Vacío")
            }
            
        }
    })

    routes.addEventListener('change', () => {
        if(routes.selectedIndex != 0){
            establecerCorrecto('routes', routes)
        }else{
            establecerIncorrecto('routes', routes, 'Selecciona una ruta')
        }
    })

    dateField.addEventListener('keyup', validateDate)
    dateField.addEventListener('change', validateDate)

    // Clic para abrir el modal del registro para el nuevo producto
    buttonAddSale.addEventListener('click', async () => {
        productIdToEdit = undefined
        productToEdit = undefined

        toggleModalForm()
        prepareModalForm()
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

    // Cada vez que el usuario escriba una cantidad
    quantity.addEventListener('keyup', () => {
        regulateQuantity() // Regulala en funcion del stock
    })

    // Cada vez que cambia la cantidad por medio de los botones del campo
    quantity.addEventListener('change', () => {
        regulateQuantity()
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

    // Clic para seleccionar algun producto
    productsDescription.addEventListener('change', () => {
        clearValidations(fields[5].name, fields[5])
        clearValidations(fields[6].name, fields[6])
        clearValidations(fields[9].name, fields[9])
        ocultarMensajeCaution(sale.name, sale)

        sale.readOnly = true
        saleIconLock.src = icons.lockIcon
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

    logCards.addEventListener('click', async (event) => {
        
        if(event.target.closest(`.card__button`) == null && event.target.closest(`#buttonAddSale`) == null && event.target.closest(`.card__default`) == null){ // Esto asegura que el bloque dentro del codigo se active solo cuando se de clic sobre la tarjeta y no sobre los botones
            const card = event.target.closest('.card')
            const id = card.children[0].children[1].children[0].id
            editProductSale(id)
        }
    })

    initialQuantityBoxes.addEventListener('keyup', () => validateNumbers('intNumbers', initialQuantityBoxes))
    initialQuantityBoxes.addEventListener('change', () => validateNumbers('intNumbers', initialQuantityBoxes))

    saleIconLock.addEventListener('click', () => {
        if (productsDescription.selectedIndex == 0) {
            mostrarMensajeCaution(sale.name, sale, 'Elige un producto')
            return
        }

        if (isProductRepeated) {
            mostrarMensajeCaution(sale.name, sale, 'Producto repetido')
            return
        }

        sale.readOnly = !sale.readOnly
        saleIconLock.src = sale.readOnly ? icons.lockIcon : icons.lockOpen
        validateNumbers('prices', sale)
    })

    sale.addEventListener('keyup', () => validateNumbers('prices', sale))

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
            await window.electronAPI.navigateTo(links.newProduct, -1,  'create')
        }

        showSwalConfirm(goToSomeWhere, confirmContent)
    })
})

window.addEventListener('keyup', async (keyEvent) => {
    if(keyEvent.code == 'NumpadAdd'){
        productIdToEdit = undefined
        productToEdit = undefined

        toggleModalForm()
        prepareModalForm()
    }
})

init()