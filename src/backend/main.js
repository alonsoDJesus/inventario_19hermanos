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
        ORDER BY Venta_FK__detalleventa ASC;
    `)

    return piecesInitialSales
}

async function getInitialSales(){
    const conn = await getConnection()
    const initialSales = await conn.query(`
        SELECT 	Venta_PK as id, 
                CONCAT(Nombre__distribuidor, ' ', Apellido_paterno__distribuidor, ' ', Apellido_materno__distribuidor) as nombre, 
                Nombre__ruta as ruta, 
                Hora_inicio__venta as salida
        FROM venta
        INNER JOIN turno ON Turno_FK__venta = Turno_PK
        INNER JOIN distribuidor ON Distribuidor_FK__turno = Distribuidor_PK
        INNER JOIN ruta ON Ruta_FK__turno = Ruta_PK
        WHERE Hora_fin__venta IS NULL
        ORDER BY Venta_PK ASC;
    `)

    const piecesOfInitialSales = await getPiecesInitialSales()
    
    for (let index = 0; index < initialSales.length; index++) {
        initialSales[index].cantidad_piezas = piecesOfInitialSales[index].cantidad_piezas
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

function createWindow(width, height) {
    window = new BrowserWindow({
        width: width,
        height: height,
        webPreferences: {
            nodeIntegration: true, // Habilita Node.js en la ventana del navegador
            enableRemoteModule: true, // Habilita el módulo remote
            preload: path.join(__dirname, 'preload.js')
        }
    })
    window.loadFile('../inv_19h_electron_mysql/src/frontend/index.html')
}

module.exports = {
    createWindow,
    getInitialSales,
    getCompletedSales
}