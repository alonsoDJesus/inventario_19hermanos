const containerCards = document.getElementById('containerCards')

function renderCompletedSales(completedSales) {
   if (completedSales.length != 0) {
       containerCards.innerHTML = ''

       completedSales.forEach(sale => {
           containerCards.innerHTML += `
           <div class = "card">

               <div class="card_body">
                   <div class="card_data">
                       <p class="data data_id">${sale.id}</p>
                       <p class="data data_nombre">${sale.nombre}</p>
                       <p class="data data_ruta">${sale.salida}</p>
                       <p class="data data_time">${sale.llegada}</p>
                       <p class="data number">${sale.venta}</p>
                       <p class="data number">${sale.costo}</p>
                       <p class="data number">${sale.utilidad}</p>
                   </div>
               </div>
               
           </div>
       `;
       });
   }
}

async function getCompletedSales(com){
   const completedSales = await window.electronAPI.selectCompletedSales()
   renderCompletedSales(completedSales)
}

getCompletedSales()