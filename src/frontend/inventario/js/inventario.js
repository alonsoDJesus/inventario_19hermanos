const fieldsCheck = {
    searchField: false
}

let allProducts = []

function renderProducts(searchType) {
    console.log(searchType)
}

function init(){
    const sortSelector = document.getElementById('sortSelector')
    const searchField = document.getElementById('searchField')
    const buttonSearch = document.getElementById('buttonSearch')

    sortSelector.addEventListener('change', determinateSearchCriteriaBySelector)

    searchField.addEventListener('keyup', () => {
        if(searchField.value == ''){
            clearValidations(searchField.name, searchField)
            determinateSearchCriteriaBySelector()
        }else {
            const checkValue =  window.electronAPI.testByRegexp(searchField.value, 'codeProduct')
            if(searchField.value.length > 0 && searchField.value.length < 10 && checkValue){
                establecerCorrecto(searchField.name, searchField)
            }else{
                const errorMessage = 'El código es demasiado largo\no escribiste algun símbolo raro'
                establecerIncorrecto(searchField.name, searchField, errorMessage)
            }
        }
    })

    buttonSearch.addEventListener('click', async () => {
        if (fieldsCheck.searchField){
            fetchProductsWithCriteria(searchField.value, 'specific')
        }
    })
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
    }
}

init()

window.addEventListener('load', () => {
    const navHome = document.getElementById('navHome')
    const navNewSale = document.getElementById('navNewSale')
    const navCompletedSales = document.getElementById('navCompletedSales')
    const navStock = document.getElementById('navStock')
    
    navHome.addEventListener('click', async  () => {
        await window.electronAPI.navigateTo(links.home)
    })
 
    navNewSale.addEventListener('click', async () => {
        await window.electronAPI.navigateTo(links.newSale)
    })
 
    navCompletedSales.addEventListener('click', async () => {
        await window.electronAPI.navigateTo(links.completedSales)
    })

    navStock.addEventListener('click', async () => {
        await window.electronAPI.navigateTo(links.stock)
    })
})