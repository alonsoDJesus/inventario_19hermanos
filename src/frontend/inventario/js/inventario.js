const fieldsCheck = {
    searchField: false
}
const optionsFormat = {
    style: 'currency',
    currency: 'USD'
}
const format = new Intl.NumberFormat('en-US', optionsFormat);

let allProducts = []
let quantityProductsToSupply = {
    lowLevelQuantity: 0,
    midLevelQuantity: 0
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

function determinateColorStockIndicator(stock, minStock, maxStock){

    if (stock <= minStock) {
        quantityProductsToSupply.lowLevelQuantity++
        return icons.circleRed
    } else{
        const midPoint = (minStock + maxStock) / 2
        if(stock <= midPoint){
            quantityProductsToSupply.midLevelQuantity++
            return icons.circleYellow
        }else{
            return icons.circleGreen
        }
    }
}

function searchProduct(){
    if (fieldsCheck.searchField) {
        fetchProductsWithCriteria(searchField.value, 'specific')
    }
}

function renderProducts(searchType) {
    const productsContainer = document.getElementById('productsContainer') // Contenedor de las tarjetas
    productsContainer.innerHTML = '' // El contenedor se reinicia en cada renderización
    !productsContainer.classList.contains('view-grid-4') ?  productsContainer.classList.add('view-grid-4') : '' // Añade la vista de grid en caso de que se necesite

    if (allProducts.length !== 0) {
        allProducts.forEach( (product) => {
            // Tarjeta 
            const card = document.createElement('article')
            card.classList.add('card')

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
                    [icons.dollarWhite, `Costo: ${format.format(parseFloat(product.cost).toFixed(2))}`],
                    [icons.dollarWhite, `Venta: ${format.format(parseFloat(product.sale).toFixed(2))}`],
                    [determinateColorStockIndicator(product.stock, product.minStock, product.maxStock), `Existencias: ${product.stock}`],
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
        `Aún no tienes ningún producto. <br>Registra uno dando clic en el botón de agregar.` : 
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
    const searchField = document.getElementById('searchField')
    const buttonSearch = document.getElementById('buttonSearch')
    const buttonAddProduct = document.getElementById('buttonAddProduct')

    sortSelector.addEventListener('change', determinateSearchCriteriaBySelector)

    searchField.addEventListener('keyup', (event) => {
        if (searchField.value == '') {
            clearValidations(searchField.name, searchField)
            determinateSearchCriteriaBySelector()
        } else {
            if (event.code == 'NumpadEnter' || event.code == 'Enter') {
                searchProduct()
            } else {
                const checkValue = window.electronAPI.testByRegexp(searchField.value, 'codeProduct')
                if (checkValue) {
                    establecerCorrecto(searchField.name, searchField)
                } else {
                    const errorMessage = 'El código es demasiado largo\no escribiste algun símbolo raro'
                    establecerIncorrecto(searchField.name, searchField, errorMessage)
                }
            }
        }
    })

    buttonSearch.addEventListener('click', async () => {
        searchProduct()
    })

    buttonAddProduct.addEventListener('click', () => {
        console.log('redirigiendo')
    })

    await fetchProductsWithCriteria('code')

    showWarningStockMessage()
}

async function fetchProductsWithCriteria(searchCriteriaDeterminator, searchType = 'all'){
    allProducts = await window.electronAPI.selectProducts(searchCriteriaDeterminator)
    renderProducts(searchType)
}

function determinateSearchCriteriaBySelector(){
    switch (sortSelector.selectedIndex) {
        case 1:
            fetchProductsWithCriteria('code')
            break;
    
        case 2:
            fetchProductsWithCriteria('stock')
            break;
        
        default:
            fetchProductsWithCriteria('code')
            break;
    }
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