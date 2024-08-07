const radioShowDate = document.getElementById('radioShowDate')
const radioShowAll = document.getElementById('radioShowAll')
const dateField = document.getElementById('date')
const buttonSearch = document.getElementById('buttonSearch')

let completedSales = undefined
let criteria = 'all'
let fieldsCheck = {
    date: false
}

async function deleteCompletedSale(saleId) {
    await swal({
        icon: 'warning',
        title: '¿Estás seguro de eliminar esta liquidacion?',
        text: 'Todos los datos se perderán y afectará en tu estado de resultados :\'(',
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
            await window.electronAPI.deleteSale(saleId)

            await swal({
                title: "Liquidación eliminada exitosamente",
                button: {
                    text: 'Aceptar'
                }
            })
        }
    })

    criteria == 'all' ? getCompletedSales() : getCompletedSalesWithCriteria(dateField.value)
}

function renderCompletedSales(searchType = 'all') {
    const containerCards = document.getElementById('containerCards')

    containerCards.innerHTML = ''
    if (completedSales && completedSales.length != 0) {

       completedSales.forEach(sale => {
           containerCards.innerHTML += `
           <div class = "card" id = "${sale.id}">

               <div class="card__body">
                   <div class="card__data">
                        <p class="data">${sale.nombre}</p>
                        <p class="data">${sale.ruta}</p>
                        <p class="data">${sale.fecha}</p>
                        
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
                        <div class="card_button" id = "deleteNewSaleButton" onclick = "deleteCompletedSale(${sale.id})"><div></div></div>
                    </div>
               </div>
               
           </div>
      `;});
    }else{
        const notFoundMessage = criteria != 'all' ?  
        `No se encontró alguna venta en esta fecha.` :
        `Aún no tienes ninguna liquidacion. <br>Las liquidaciones irán aparaciendo automáticamente.` 

        containerCards.innerHTML += `
            <div class="card default">
                <p class="text_example">
                    ${notFoundMessage}
                </p>
            </div>  
        `;
    }

    containerCards.children.length > 3 ? document.getElementById('containerSales').classList.add('h-35rem') : document.getElementById('containerSales').classList.remove('h-35rem')
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
    criteria = 'all'
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
        criteria = 'byDate'
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

containerCards.addEventListener('click', async (event) => {
    let card
    
    if(event.target.closest('#deleteNewSaleButton') == null && event.target.closest('.default') == null && event.target.closest('.card') != null){
        card = event.target.closest('.card')
        
        await window.electronAPI.navigateTo(links.completingSale, card.id, 'secondEdition')
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