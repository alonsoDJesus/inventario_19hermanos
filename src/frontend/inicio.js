let initialSales = undefined

function renderInitialSales() {
    const containerCards = document.getElementById('containerCards')

    if (initialSales.length != 0) {
        containerCards.innerHTML = ''

        initialSales.forEach(sale => {
            containerCards.innerHTML += `
            <div class = "card">

                <div class="card_body">
                    <div class="card_data">
                        <p class="data">${sale.id}</p>
                        <p class="data">${sale.nombre}</p>
                        <p class="data">${sale.ruta}</p>
                        <p class="data">${sale.fecha}</p>
                        <p class="data">${sale.salida}</p>
                        <p class="data">${sale.cantidad_piezas}</p>
                    </div>

                    <div class="card_buttons">
                        <div class="card_button"><div></div></div>
                        <div class="card_button"><div></div></div>
                        <div class="card_button"><div></div></div>
                    </div>
                </div>
                
            </div>
        `;
        });
    }
}

async function getInitialSales(){
    initialSales = await window.electronAPI.selectInitialSales()
    renderInitialSales()
}

getInitialSales();

window.addEventListener('load', () => {
    const navHome = document.getElementById('navHome')
    const navNewSale = document.getElementById('navNewSale')
    const navCompletedSales = document.getElementById('navCompletedSales')
    
    navHome.addEventListener('click', async  () => {
        await window.electronAPI.navigateTo('home')
    })
 
    navNewSale.addEventListener('click', () => {
        goToNewSale()
    })
 
    navCompletedSales.addEventListener('click', async () => {
        await window.electronAPI.navigateTo('completedSales')
    })
})