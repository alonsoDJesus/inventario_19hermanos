const {BrowserWindow} = require('electron')
const path = require('node:path')
const { getConnection } = require('./database')

let window;

async function getPiecesInitialSales(){
    const conn = await getConnection()

    const piecesInitialSales = await conn.query(`
        SELECT Venta_FK__detalleventa as id, 
        SUM(Cantidad_piezas_inicio__detalleventa) as cantidad_piezas
        FROM detalleventa
        WHERE Cantidad_piezas_fin__detalleventa IS NULL
        GROUP BY Venta_FK__detalleventa
        ORDER BY Venta_FK__detalleventa DESC;
    `)

    return piecesInitialSales
}

async function getInitialSales(){
    const conn = await getConnection()
    const initialSales = await conn.query(`
        SELECT 	Venta_PK as id, 
            CONCAT(Nombre__distribuidor, ' ', Apellido_paterno__distribuidor, ' ', Apellido_materno__distribuidor) as nombre, 
            Nombre__ruta as ruta, 
            Fecha__venta as fecha,
            Hora_inicio__venta as salida
        FROM venta
        INNER JOIN turno ON Turno_FK__venta = Turno_PK
        INNER JOIN distribuidor ON Distribuidor_FK__turno = Distribuidor_PK
        INNER JOIN ruta ON Ruta_FK__turno = Ruta_PK
        WHERE Hora_fin__venta IS NULL
        ORDER BY Venta_PK DESC;
        `)

    const piecesOfInitialSales = await getPiecesInitialSales()
    
    for (let index = 0; index < initialSales.length; index++) {
        initialSales[index].cantidad_piezas = piecesOfInitialSales[index].cantidad_piezas
        
        let fecha = new Date(initialSales[index].fecha)
        dia = fecha.getDate()
        mes = fecha.getMonth()
        anio = fecha.getFullYear()

        dia = dia >= 1 && dia < 10 ? `0${dia}` : `${dia}`
        mes = mes >= 0 && mes < 10 ? `0${mes + 1}` : `${mes + 1}`
        initialSales[index].fecha = `${dia}/${mes}/${anio}`
    }

    return initialSales;
}

async function getCompletedSales(){
    const conn = await getConnection()
    const completedSales = await conn.query(`
        SELECT 	Venta_PK as id, 
                CONCAT(Nombre__distribuidor, ' ', Apellido_paterno__distribuidor, ' ', Apellido_materno__distribuidor) as nombre, 
                Nombre__ruta as ruta, 
                Hora_inicio__venta as salida,
                Hora_fin__venta as llegada,
                Venta_total_global__venta as venta,
                Costo_total_global__venta as costo,
                Utilidad_total_global__venta as utilidad
        FROM venta
        INNER JOIN turno ON Turno_FK__venta = Turno_PK
        INNER JOIN distribuidor ON Distribuidor_FK__turno = Distribuidor_PK
        INNER JOIN ruta ON Ruta_FK__turno = Ruta_PK
        WHERE Hora_fin__venta IS NOT NULL
        ORDER BY Venta_PK ASC;
    `)

    completedSales.forEach(sale => {
        sale.venta = Intl.NumberFormat().format(sale.venta)
        sale.costo = Intl.NumberFormat().format(sale.costo)
        sale.utilidad = Intl.NumberFormat().format(sale.utilidad)
    });

    return completedSales
}


async function getEmployees(){
    const conn = await getConnection()
    const employees = await conn.query(`
        SELECT 
	        Distribuidor_PK as id,
	        CONCAT(Nombre__distribuidor, ' ', Apellido_paterno__distribuidor, ' ', Apellido_materno__distribuidor) as nombre 
        FROM distribuidor;
    `)

    return employees;
}

async function getRoutes(){
    const conn = await getConnection()
    const routes = await conn.query(`
        SELECT
	        Ruta_PK as id,
	        Nombre__ruta as ruta 
        FROM ruta;
    `)

    return routes
}

async function getLastSaleID(){
    const conn = await getConnection()
    const lastSaleID = await conn.query(`
        SELECT MAX(Venta_PK) as lastSaleID
        FROM venta;
    `)

    return lastSaleID[0].lastSaleID
}

async function getProducts(){
    const conn = await getConnection()
    const products = await conn.query(`
        SELECT 	Producto_PK as id,
            Descripcion__producto as descrip,
            Cantidad_piezas_por_caja__producto as piecesInBox,
            Precio_costo__producto as cost,
            Precio_venta__producto as sale,
            Cantidad_existencias_actual_inventario__producto as stock
        FROM producto;
    `)

    products.forEach(product => {
        product.cost = Intl.NumberFormat().format(product.cost)
        product.sale = Intl.NumberFormat().format(product.sale)
    });

    return products
}

async function setNewShift(newShift){
    const conn = await getConnection()
    try {
        const shiftInserted = await conn.query('INSERT INTO turno SET ?', newShift)

        return shiftInserted.insertId
    } catch (error) {
        return error
    }
}

async function setNewSaleWithShift(newSaleWithShift){
    const conn = await getConnection()
    try {
        const saleWithShiftInserted = await conn.query('INSERT INTO venta SET ?', newSaleWithShift)

        return saleWithShiftInserted.insertId
    } catch (error) {
        return error
    }
}

async function setSaleDetail(saleDetail){
    const conn = await getConnection()
    try {
        //const saleWithShiftInserted = await conn.query('INSERT INTO venta SET ?', newSaleWithShift)
        for (let index = 1; index <= Object.keys(saleDetail).length; index++) {
            delete saleDetail[index].description
            delete saleDetail[index].quantityBoxes

            await conn.query('INSERT INTO detalleventa SET ?', saleDetail[index])
        }
    } catch (error) {
        console.log(error)
    }
}

function createWindow(width, height) {
    window = new BrowserWindow({
        width: width,
        height: height,
        resizable: false,
        webPreferences: {
            nodeIntegration: true, // Habilita Node.js en la ventana del navegador
            enableRemoteModule: true, // Habilita el módulo remote
            preload: path.join(__dirname, 'preload.js')
        }
    })
    window.loadFile('../inv_19h_electron_mysql/src/frontend/inicio/index.html')
}

module.exports = {
    createWindow,
    getInitialSales,
    getCompletedSales,
    getEmployees,
    getRoutes,
    getLastSaleID,
    getProducts,
    setNewShift,
    setNewSaleWithShift,
    setSaleDetail
}