const radioShowDate = document.getElementById('radioShowDate')
const radioShowAll = document.getElementById('radioShowAll')
const dateField = document.getElementById('date')
const buttonSearch = document.getElementById('buttonSearch')
const buttonAddSale = document.getElementById('buttonAddSale')
const containerCards = document.getElementById('containerCards')

let cards

let initialSales = undefined
let fieldsCheck = {
    date: false
}

async function goToCompletingSale(event, id) {
    await window.electronAPI.navigateTo(links.completingSale, id)
}

function renderInitialSales(searchType = 'all') {

    containerCards.innerHTML = ''
    if (initialSales && initialSales.length != 0) {
        initialSales.forEach(sale => {
            containerCards.innerHTML += `
                <div class = "card" id = "${sale.id}">

                    <div class="card_body">
                        <div class="card_data">
                            <p class="data">${sale.id}</p>
                            <p class="data">${sale.nombre}</p>
                            <p class="data">${sale.ruta}</p>
                            <p class="data">${sale.fecha}</p>
                            <p class="data">${sale.salida}</p>
                            <p class="data">${sale.cantidad_cajas}</p>
                        </div>

                        <div class="card_buttons">
                            <div class="card_button" id = "editNewSaleButton" onclick="goToCompletingSale(event, ${sale.id})"><div></div></div>
                            <div class="card_button"><div></div></div>
                            <div class="card_button"><div></div></div>
                        </div>
                    </div>
                
                </div>
            `;
        });
    }else{
        const notFoundMessage = searchType == 'all' ?  
        `Aún no tienes ninguna venta. <br>Registra una dando clic en el botón de agregar.` : 
        `No se encontró alguna venta en esta fecha.`
        containerCards.innerHTML += `
            <div class="card">
                <p class="text_example">
                    ${notFoundMessage}
                </p>
            </div>  
        `;
    }
}

function checkDate(){
    if(dateField.value != ''){
        const dateRegistered = new Date(dateField.value)
        year = dateRegistered.getFullYear()
        year >= 2024 && year < 2500 ? establecerCorrecto('date', dateField) : establecerIncorrecto('date', dateField, 'Fecha Incorrecta')
    }
}

async function getInitialSales(){
    initialSales = await window.electronAPI.selectInitialSales()
    renderInitialSales()
}

async function getInitialSalesWithCriteria(dateCriteria){
    initialSales = await window.electronAPI.selectInitialSales(dateCriteria)
    renderInitialSales('byDate')
}

radioShowDate.addEventListener('click', () => {
    document.querySelector('.input-group').classList.toggle('display-none')
})

radioShowAll.addEventListener('click', () => {
    document.querySelector('.input-group').classList.toggle('display-none')
    getInitialSales()
})

dateField.addEventListener('keyup', () => {
    checkDate()
})

dateField.addEventListener('change', () => {
    checkDate()
})

buttonSearch.addEventListener('click', async () => {
    if (fieldsCheck.date) {
        getInitialSalesWithCriteria(dateField.value)
    }else{
        await swal({
            icon: "warning",
            title: "Fecha incorrecta",
            text: "No se pudo realizar la busqueda porque la fecha no es válida",
            button: {
                text: 'Aceptar'
            }
        })
    }
})

buttonAddSale.addEventListener('click', async () => {
    await window.electronAPI.navigateTo(links.newSale)    
})

containerCards.addEventListener('click', async (event) => {
    let card
    
    if(event.target.closest('#editNewSaleButton') == null){
        card = event.target.closest('.card')
        
        await window.electronAPI.navigateTo(links.newSale, card.id, 'edit')
    }
})

getInitialSales();

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
        await window.electronAPI.navigateTo(links.newProduct, -1,  'create')
    })
})