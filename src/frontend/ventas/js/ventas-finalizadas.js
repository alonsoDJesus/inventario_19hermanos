const containerCards = document.getElementById('containerCards')

function renderCompletedSales(completedSales) {
   if (completedSales.length != 0) {
       containerCards.innerHTML = ''

       completedSales.forEach(sale => {
           containerCards.innerHTML += `
           <div class = "card">

               <div class="card__body">
                   <div class="card__data">
                        <p class="data">${sale.id}</p>
                        <p class="data">${sale.nombre}</p>
                        <p class="data">${sale.ruta}</p>
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
               </div>
               
           </div>
      `;});
   }
}

async function getCompletedSales(com){
   const completedSales = await window.electronAPI.selectCompletedSales()
   renderCompletedSales(completedSales)
}

getCompletedSales()

window.addEventListener('load', () => {
   const navHome = document.getElementById('navHome')
   const navNewSale = document.getElementById('navNewSale')
   const navCompletedSales = document.getElementById('navCompletedSales')
   
   navHome.addEventListener('click', async () => {
       goToHome()
   })

   navNewSale.addEventListener('click', async () => {
       goToNewSale()
   })

   navCompletedSales.addEventListener('click', async () => {
       goToCompletedSales()
   })
})