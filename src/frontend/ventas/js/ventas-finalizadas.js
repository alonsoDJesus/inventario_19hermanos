const containerCards = document.getElementById('containerCards')

function renderCompletedSales(completedSales) {
   if (completedSales.length != 0) {
       containerCards.innerHTML = ''

       completedSales.forEach(sale => {
           containerCards.innerHTML += `
           <div class = "card">

               <div class="card__body">
                   <div class="card__data">
                        <p class="data data_id">${sale.id}</p>
                        <p class="data data_nombre">${sale.nombre}</p>
                        <p class="data data_ruta">${sale.ruta}</p>
                        <div class="data__container itinerary">
                           <p class= "data__containerheader">Inicio</p>
                           <p clas= "data__containerheader">Fin</p>
                           <p class="data_salida">${sale.salida}</p>
                           <p class="data_llegada">${sale.llegada}</p>
                        </div>
                        <div class="data__container summary">
                           <p class= "data__containerheader">Venta</p>
                           <p clas= "data__containerheader">Costo</p>
                           <p class= "data__containerheader">Utilidad</p>
                           <p class="number">${sale.venta}</p>
                           <p class="number">${sale.costo}</p>
                           <p class="number">${sale.utilidad}</p>
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