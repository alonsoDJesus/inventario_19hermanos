const searchField = document.getElementById('searchField')
const cardMenu = document.querySelector('.card__menu')
const optionModifyProductData = document.getElementById('optionModifyProductData')
const optionModifyProductStock = document.getElementById('optionModifyProductStock')
const listSuggestions = document.getElementById('listSuggestions')

const fieldsCheck = {
    searchField: false
}

const numericMXFormat = {
    style: "currency",
    currency: "MXN"
};

let allProducts = []
let productsNameSuggestions = []
let listSuggestionsItems = []
let lowLevelProducts = [], midLevelProducts = [], highLevelProducts =[]
let searchCriteriaDeterminator = '', searchType = ''
let previousCardId = -1
let quantityProductsToSupply = {
    lowLevelQuantity: 0,
    midLevelQuantity: 0
}
let productCodeToEdit = ''
let currentIndexItem = -1
let focusedElement = ""

function setSearchField(searchValue){
    searchField.value = searchValue
}

function roundToTwo(num) {
    return +(Math.round(num + 'e+2') + 'e-2');
}

function toggleListSuggestions(toggleAction){
    if (toggleAction == 'hide') {
        listSuggestions.classList.add('display-none')
        listSuggestionsItems = []
        return 
    }
    
    listSuggestions.classList.remove('display-none')
}

function setItemSelected(itemSelected){
    setSearchField(itemSelected)
    searchProduct()
    toggleListSuggestions('hide')
    focusedElement = searchField.id
}

function setSuggestionsOnList(){
    listSuggestions.innerHTML = ''
    productsNameSuggestions.forEach(suggestion => {
        const item = document.createElement('li')
        item.innerText = suggestion['descrip']
        item.setAttribute('id', suggestion['codigo'])
        listSuggestions.appendChild(item)
        item.addEventListener('click', () => setItemSelected(suggestion['descrip']))
    });

    listSuggestionsItems = document.querySelectorAll('#listSuggestions li')
    currentIndexItem = -1
}

function setQuantityProductsToSupply(){
    quantityProductsToSupply.lowLevelQuantity = lowLevelProducts.length
    quantityProductsToSupply.midLevelQuantity = midLevelProducts.length
}

function showWarningStockMessage(){
    let showMessage = false
    const warningStockMessageContainer = document.querySelector('#warningStokMessage')
    const warningStockMessage = document.querySelector('#warningStokMessage p')
    
    if(quantityProductsToSupply.lowLevelQuantity != 0){
        warningStockMessage.innerText = `¡Tienes ${quantityProductsToSupply.lowLevelQuantity} ${quantityProductsToSupply.lowLevelQuantity == 1 ? 'producto' :'productos'} a punto de agotarse`
        warningStockMessageContainer.classList.remove('display-none')
        showMessage = true
    }

    if(quantityProductsToSupply.midLevelQuantity != 0){
        const midLevelQuantityString = `${quantityProductsToSupply.midLevelQuantity} ${quantityProductsToSupply.midLevelQuantity == 1 ? 'producto' :'productos'} abajo del nivel óptimo de existencias`
        warningStockMessage.innerText = warningStockMessage.innerText != "" ? warningStockMessage.innerText += ` y ${midLevelQuantityString} `: `¡Tienes ${midLevelQuantityString}`
        showMessage = true
    }

    if(showMessage){
        const closeButtonWarningMessage = document.querySelectorAll('#warningStokMessage img')
        closeButtonWarningMessage[1].onclick = () => warningStockMessageContainer.classList.add('display-none')
        warningStockMessage.innerText+='!'
        warningStockMessageContainer.classList.remove('display-none')
    }

    
}

function levelClassifier(){
    allProducts.forEach((product) => {
        if (product.stock <= product.minStock) {
        product.levelIndicator = icons.circleRed
        lowLevelProducts.push(product)
    } else{
        const midPoint = (product.minStock + product.maxStock) / 2
        if(product.stock <= midPoint){
            product.levelIndicator = icons.circleYellow
            midLevelProducts.push(product)
        }else{
            product.levelIndicator = icons.circleGreen
            highLevelProducts.push(product)
        }
    }
    })
}

function searchProduct(){
    if (fieldsCheck.searchField) {
        searchCriteriaDeterminator = searchField.value
        searchType = 'specific'
        fetchProductsWithCriteria()
    }
}

function formatNumberWitDecimals(num, includeDollarSign = true){
    num = new Number(parseFloat(num)).toLocaleString("es-MX", numericMXFormat)
    num =  !includeDollarSign ? num.replace('$', '') : num
    return num
}

function renderProducts(searchType) {
    const productsContainer = document.getElementById('productsContainer') // Contenedor de las tarjetas
    productsContainer.innerHTML = '' // El contenedor se reinicia en cada renderización
    !productsContainer.classList.contains('view-grid-4') ?  productsContainer.classList.add('view-grid-4') : '' // Añade la vista de grid en caso de que se necesite

    if (allProducts.length !== 0) {
        allProducts.forEach( async (product, index) => {
            // Tarjeta 
            const card = document.createElement('article')
            card.classList.add('card')
            card.id = index

                // Etiqueta de la tarjeta
                const cardTag = document.createElement('div')
                cardTag.classList.add('card__tag')

                    const tagContent = document.createElement('p')
                    tagContent.innerText = product.codigo
                    cardTag.appendChild(tagContent)

                // Nombre del producto en la tarjeta
                const cardTitle = document.createElement('div')
                cardTitle.classList.add('card__title')

                    const titleContent = document.createElement('p')
                    titleContent.innerText = product.descrip
                    cardTitle.appendChild(titleContent)
                
                // Linea separadora
                const line = document.createElement('hr')

                // Contenido de la tarjeta
                const cardBody = document.createElement('div')
                cardBody.classList.add('card__body')

                // Arreglo con datos adicionales sobre el producto en cuestión
                let arrayBodyData = [
                    [icons.boxesWhite, `${product.piecesInBox} ${product.piecesInBox == 1 ? 'pieza' : 'piezas'} por caja`],
                    [icons.dollarWhite, `Costo: ${formatNumberWitDecimals(product.cost)}`],
                    [icons.dollarWhite, `Venta: ${formatNumberWitDecimals(product.sale)}`],
                    [icons.percent, `Ganancia: ${formatNumberWitDecimals((( parseFloat(product.sale) - parseFloat(product.cost) ) / parseFloat(product.cost)) * 100, false)}%`],
                    [product.levelIndicator, `Existencias: ${product.stock}`],
                ]

                arrayBodyData.forEach( (singleBodyData) => {
                    // Contenedor para los datos del producto
                    const bodyData = document.createElement('div')
                    bodyData.classList.add('body__data')

                        // Contenedor para el icono
                        const dataContainerIcon = document.createElement('div')
                        dataContainerIcon.classList.add('data__containericon')

                            // Imagen del icono
                            const dataIcon = document.createElement('img')
                            dataIcon.src = singleBodyData[0]
                            dataIcon.classList.add('h-1rem')
                            dataContainerIcon.appendChild(dataIcon)
                        
                        bodyData.appendChild(dataContainerIcon)
                        
                        // Texto de la información. Acompaña al ícono.
                        const dataInformationText = document.createElement('p')
                        dataInformationText.innerText =singleBodyData[1]
                        bodyData.appendChild(dataInformationText)
                    
                    cardBody.appendChild(bodyData)                    
                } )

                // Pie de la tarjeta
                const cardFooter = document.createElement('div')
                cardFooter.classList.add('card__footer')
                
                let arrayFooterIcons = [icons.edit, icons.delete]

                arrayFooterIcons.forEach( (singleFooterIcon) => {
                    // Contenedor para los datos del producto
                    const footerContainerIcon = document.createElement('div')
                    footerContainerIcon.classList.add('footer__containericon')

                        // Imagen del icono
                        const footerIcon = document.createElement('img')
                        footerIcon.src = singleFooterIcon
                        footerIcon.classList.add('h-1rem')
                        if (singleFooterIcon == icons.edit) {
                            footerContainerIcon.id = "editProductButton"
                            
                            footerContainerIcon.onclick = async (clickEvent) => await toggleMenuEditProduct(clickEvent, product.codigo)
                        }else{
                            footerContainerIcon.id = "deleteProductButton"
                            footerContainerIcon.onclick = () => deleteProduct(product.id)
                        }

                        footerContainerIcon.appendChild(footerIcon)
                    
                    cardFooter.appendChild(footerContainerIcon)
                } )

            card.appendChild(cardTag)
            card.appendChild(cardTitle)
            card.appendChild(line)
            card.appendChild(cardBody)
            card.appendChild(cardFooter)
            productsContainer.appendChild(card)
                
        } )
    }else{
        productsContainer.innerHTML = ''
        productsContainer.classList.remove('view-grid-4')

        const notFoundMessage = searchType == 'all' ?  
        `Aún no tienes ningún producto. Registra uno dando clic en el botón de agregar.` : 
        `No se encontró ningún producto.`
        
        // Tarjeta 
        const card = document.createElement('article')
        card.classList.add('card')

            // Texto de resultado
            const resultInformation = document.createElement('p')
            resultInformation.classList.add('card__message-notfound')
            resultInformation.innerText = notFoundMessage
        
        card.appendChild(resultInformation)
        productsContainer.appendChild(card)
    }
}

async function init() {
    const sortSelector = document.getElementById('sortSelector')
    const buttonSearch = document.getElementById('buttonSearch')
    const buttonAddProduct = document.getElementById('buttonAddProduct')

    sortSelector.addEventListener('change', determinateSearchCriteriaBySelector)

    searchField.addEventListener('keyup', async (event) => {

        if (searchField.value == '') {
            toggleListSuggestions('hide')
            clearValidations(searchField.name, searchField)
            determinateSearchCriteriaBySelector()
            return
        }

        if (searchField.value.length > 80) {
            establecerIncorrecto(searchField.name, searchField, 'Mucho texto')
            toggleListSuggestions('hide')
            return
        }

        const checkValue = window.electronAPI.testByRegexp(searchField.value, 'nameProduct')
        if (!checkValue) {
            establecerIncorrecto(searchField.name, searchField, 'Símbolos raros')
            toggleListSuggestions('hide')
            return
        }

        if (event.code == 'NumpadEnter' || event.code == 'Enter') {

            if (focusedElement == searchField.id) {
                searchProduct()
                toggleListSuggestions('hide')
                return
            }

            if (focusedElement == listSuggestions.id) {
                setItemSelected(listSuggestionsItems[currentIndexItem].innerText)
                return
            }
        }

        if (event.code == 'ArrowDown') {
            if (currentIndexItem > -1) {
                listSuggestionsItems[currentIndexItem].classList.remove('selected') 
            }

            currentIndexItem = (currentIndexItem + 1) % listSuggestionsItems.length
            listSuggestionsItems[currentIndexItem].classList.add('selected')
            focusedElement = listSuggestions.id

            return
        }

        if (event.code == 'ArrowUp') {
            
            if (currentIndexItem > -1) {
                listSuggestionsItems[currentIndexItem].classList.remove('selected')
                currentIndexItem = (currentIndexItem - 1 + listSuggestionsItems.length) % listSuggestionsItems.length
                listSuggestionsItems[currentIndexItem].classList.add('selected')
                focusedElement = listSuggestions.id
            }

            return
        }

        establecerCorrecto(searchField.name, searchField)
        focusedElement = searchField.id
        productsNameSuggestions = await window.electronAPI.selectProductsNamesSuggestions(searchField.value.trim())
        setSuggestionsOnList()
        toggleListSuggestions('show')

    })

    searchField.addEventListener('click', () => {
        if (focusedElement == listSuggestions.id) {
            listSuggestionsItems[currentIndexItem].classList.remove('selected')
            currentIndexItem = -1
            focusedElement = searchField.id
        }
    })

    buttonSearch.addEventListener('click', async () => {
        searchProduct()
    })

    buttonAddProduct.addEventListener('click', async () => { 
        await window.electronAPI.navigateTo(links.newProduct, -1, 'create')
    })

    optionModifyProductData.addEventListener('click', async () => { 
        await window.electronAPI.navigateTo(links.newProduct, productCodeToEdit, 'edit')
    })

    optionModifyProductStock.addEventListener('click', async () => { 
        await window.electronAPI.navigateTo(links.modifyStock, productCodeToEdit, 'edit')
    })

    window.addEventListener('click', (clickEvent) => {
        if (clickEvent.target.closest('#searchFieldContainer') == null && !listSuggestions.classList.contains('display-none')) {
            listSuggestions.classList.add('display-none')
            focusedElement = ""
            currentIndexItem = -1
        }
    })

    window.addEventListener('keydown', (event) => {
        if (event.code == 'ArrowUp' && !listSuggestions.classList.contains('display-none')) {
            event.preventDefault()
            return
        }
    })
   
    searchCriteriaDeterminator = 'code'
    searchType = 'all'
    await fetchProductsWithCriteria()

    //showWarningStockMessage()
}

async function toggleMenuEditProduct(clickEvent, productCode) {
    const card = clickEvent.target.closest('.card')
    const boundingInfoButtonEdit = clickEvent.target.closest('#editProductButton').getBoundingClientRect()
    productCodeToEdit = productCode

    cardMenu.style.top = `${boundingInfoButtonEdit.top}px`
    cardMenu.style.left = `${boundingInfoButtonEdit.left - 150}px`
    cardMenu.classList.toggle('display-none')
    
    if (previousCardId != -1 && card.id != previousCardId) {
        cardMenu.classList.remove('display-none')    
    }

    previousCardId = card.id
    //await window.electronAPI.navigateTo(links.newProduct, productCode, 'edit')
    
}

async function deleteProduct(productId){
    await swal({
        icon: "warning",
        title: "¿Estás seguro de eliminar este producto?",
        text: "Esta acción es de gran delicadeza, por lo que debes estar 100% seguro.",
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
                await swal({
                    icon: "warning",
                    title: "¡Confirma para eliminar!",
                    text: 'El producto ya no estará disponible para venderse pero si aparecerá en registros de ventas pasadas como "descontinuado". De esta manera no perderás datos importantes para tus estados financieros.',
                    padding: '1.4rem',
                    buttons: {
                        cancel: {
                            text: 'Cancelar',
                            value: null,
                            visible: true,
                            closeModal: true
                        },
            
                        method1: {
                            text: "Eliminar",
                            value: 1,
                            visible: true,
                            closeModal: true,
                            className: '.swal-button--confirm'
                        },
                    }
                }).then(async (value) => {
                    switch (value) {
                        case 1:
                            affectedRows = await window.electronAPI.updateProductAsUnavailable(productId)
                            if (affectedRows == 1) {
                                await swal({
                                    title: "Producto eliminado exitosamente",
                                    button: {
                                        text: 'Aceptar'
                                    }
                                })
                            }

                            fetchProductsWithCriteria()
                            
                            break;

                        default:
                            break;
                    }
                })
                    
                break;
         
            default:
                break;
          }
    })
}

async function fetchProductsWithCriteria(){
    lowLevelProducts = []
    midLevelProducts = []
    highLevelProducts = []

    allProducts = await window.electronAPI.selectProducts(searchCriteriaDeterminator, 'byDescription')

    levelClassifier()
    setQuantityProductsToSupply()

    switch (searchCriteriaDeterminator) {
        case 'stock':
            allProducts = lowLevelProducts.concat(midLevelProducts, highLevelProducts)
            break;
    
        default:
            lowLevelProducts = []
            midLevelProducts = []
            highLevelProducts = []
            break;
    }

    renderProducts(searchType)
}

function determinateSearchCriteriaBySelector(){
    searchType = 'all'
    sortSelector.selectedIndex == 2 ? searchCriteriaDeterminator = 'stock' : searchCriteriaDeterminator = 'code'
    fetchProductsWithCriteria()
}

init()

window.addEventListener('load', () => {
    const navHome = document.getElementById('navHome')
    const navNewSale = document.getElementById('navNewSale')
    const navInitiatedSales = document.getElementById('navInitiatedSales')
    const navCompletedSales = document.getElementById('navCompletedSales')
    const navStock = document.getElementById('navStock')
    const navNewProduct = document.getElementById('navNewProduct')
    
    navHome.addEventListener('click', async  () => {
        await window.electronAPI.navigateTo(links.home)
    })
 
    navNewSale.addEventListener('click', async () => {
        await window.electronAPI.navigateTo(links.newSale)
    })

    navInitiatedSales.addEventListener('click', async () => {
        await window.electronAPI.navigateTo(links.home)
    })
 
    navCompletedSales.addEventListener('click', async () => {
        await window.electronAPI.navigateTo(links.completedSales)
    })

    navStock.addEventListener('click', async () => {
        await window.electronAPI.navigateTo(links.stock)
    })

    navNewProduct.addEventListener('click', async() => {
        await window.electronAPI.navigateTo(links.newProduct, -1, 'create')
    })
})

window.addEventListener('keyup', async (keyEvent) => {
    if(keyEvent.code == 'NumpadAdd'){
        await window.electronAPI.navigateTo(links.newProduct, -1,  'create')
    }
})