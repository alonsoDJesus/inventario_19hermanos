const containerCards = document.getElementById('containerCards')

function renderInitialSales(initialSales) {
    if (initialSales.length != 0) {
        containerCards.innerHTML = ''

        initialSales.forEach(sale => {
            containerCards.innerHTML += `
            <div class = "card">

                <div class="card_body">
                    <div class="card_data">
                        <p class="data data_id">${sale.id}</p>
                        <p class="data data_nombre">${sale.nombre}</p>
                        <p class="data data_ruta">${sale.ruta}</p>
                        <p class="data data_time">${sale.salida}</p>
                        <p class="data number">${sale.cantidad_piezas}</p>
                    </div>

                    <div class="card_buttons">
                        <img src="${icons.up}" alt="" class="card_button">
                        <img src="${icons.edit}" alt="" class="card_button">
                        <img src="${icons.delete}" alt="" class="card_button">
                    </div>
                </div>
                
            </div>
        `;
        });
    }
}

async function getInitialSales(){
    const initialSales = await window.electronAPI.selectInitialSales()
    renderInitialSales(initialSales)
}

getInitialSales();

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