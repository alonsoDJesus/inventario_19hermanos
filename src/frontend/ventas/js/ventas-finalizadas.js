const radioShowDate = document.getElementById('radioShowDate')
const radioShowAll = document.getElementById('radioShowAll')
const dateField = document.getElementById('date')
const buttonSearch = document.getElementById('buttonSearch')

let completedSales = undefined
let fieldsCheck = {
    date: false
}

function renderCompletedSales(searchType = 'all') {
    const containerCards = document.getElementById('containerCards')

    containerCards.innerHTML = ''
    if (completedSales && completedSales.length != 0) {

       completedSales.forEach(sale => {
           containerCards.innerHTML += `
           <div class = "card">

               <div class="card__body">
                   <div class="card__data">
                        <p class="data">${sale.id}</p>
                        <p class="data">${sale.nombre}</p>
                        <p class="data">${sale.ruta}</p>
                        <p class="data">${sale.fecha}</p>
                        <div class="data__container itinerary">
                           <p class= "data__containerheader">Inicio</p>
                           <p class= "data__containerheader">Fin</p>
                           <p class="data_salida">${sale.salida}</p>
                           <p class="data_llegada">${sale.llegada}</p>
                        </div>
                        <div class="data__container summary">
                           <p class= "data__containerheader">Venta</p>
                           <p class= "data__containerheader">Costo</p>
                           <p class= "data__containerheader">Utilidad</p>
                           <p class="number">$${sale.venta}</p>
                           <p class="number">$${sale.costo}</p>
                           <p class="number">$${sale.utilidad}</p>
                        </div> 
                   </div>
                   <div class="card_buttons">
                        <div class="card_button"><div></div></div>
                        <div class="card_button"><div></div></div>
                    </div>
               </div>
               
           </div>
      `;});
    }else{
        const notFoundMessage = searchType != 'all' ?  
        `No se encontró alguna venta en esta fecha.` :
        `Aún no tienes ninguna venta finalizada. <br>Las ventas finalizadas irán aparaciendo automáticamente.` 

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

async function getCompletedSales(){
   completedSales = await window.electronAPI.selectCompletedSales()
   renderCompletedSales()
}

async function getCompletedSalesWithCriteria(dateCriteria){
    completedSales = await window.electronAPI.selectCompletedSales(dateCriteria)
    renderCompletedSales('date')
}

radioShowDate.addEventListener('click', () => {
    document.querySelector('.input-group').classList.toggle('display-none')
})

radioShowAll.addEventListener('click', () => {
    document.querySelector('.input-group').classList.toggle('display-none')
    getCompletedSales()
})

dateField.addEventListener('keyup', () => {
    checkDate()
})

dateField.addEventListener('change', () => {
    checkDate()
})

buttonSearch.addEventListener('click', async () => {
    if (fieldsCheck.date) {
        getCompletedSalesWithCriteria(dateField.value)
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

window.addEventListener('load', () => {
    const navHome = document.getElementById('navHome')
    const navNewSale = document.getElementById('navNewSale')
    const navCompletedSales = document.getElementById('navCompletedSales')
    const navInitiatedSales = document.getElementById('navInitiatedSales')
    const navStock = document.getElementById('navStock')
    const navNewProduct = document.getElementById('navNewProduct')
   
    navHome.addEventListener('click', async () => {
        await window.electronAPI.navigateTo(links.home)
    })

    navNewSale.addEventListener('click', async () => {
        await window.electronAPI.navigateTo(links.newSale)
    })

    navCompletedSales.addEventListener('click', async () => {
        await window.electronAPI.navigateTo(links.completedSales)
    })

    navInitiatedSales.addEventListener('click', async () => {
        await window.electronAPI.navigateTo(links.home)
    })

    navStock.addEventListener('click', async () => {
        await window.electronAPI.navigateTo(links.stock)
    })

    navNewProduct.addEventListener('click', async() => {
        await window.electronAPI.navigateTo(links.newProduct, -1, 'create')
    })
})

getCompletedSales()