const {BrowserWindow} = require('electron')
const path = require('node:path')
const { getConnection } = require('./database')

let window;

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
            Codigo__producto as codigo,
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
    getEmployees,
    getRoutes,
    getLastSaleID,
    getProducts,
    setNewShift,
    setNewSaleWithShift,
    setSaleDetail
}