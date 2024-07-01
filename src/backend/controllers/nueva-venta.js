const { getConnection } = require('../database')
const { getProducts } = require('./inventario') 
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
	        Nombre__ruta as ruta,
            Codigo__ruta as codigo 
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

async function getInitiatedSaleById(id){

    try {
        const conn = await getConnection()
        const sale = await conn.query(`
            SELECT
                Distribuidor_FK__turno as vendedorId,
                Codigo__ruta as codigoRuta,
                Ruta_FK__turno as rutaId,
                Fecha_inicio__venta as fechaInicio,
                Hora_inicio__venta as horaInicio,
                Cajas_inicio__venta as cantidadCajas,
                Turno_FK__venta as turnoId
            FROM venta 
            INNER JOIN turno ON Turno_FK__venta = Turno_PK
            INNER JOIN distribuidor ON Distribuidor_FK__turno = Distribuidor_PK
            INNER JOIN ruta ON Ruta_FK__turno = Ruta_PK
            WHERE Venta_PK = ${id};
        `)

        let fecha = new Date(sale[0].fechaInicio)
        let dia = fecha.getDate()
        let mes = fecha.getMonth()
        let anio = fecha.getFullYear()

        dia = dia >= 1 && dia < 10 ? `0${dia}` : `${dia}`
        mes = mes >= 0 && mes < 10 ? `0${mes + 1}` : `${mes + 1}`
        sale[0].fechaInicio = `${anio}-${mes}-${dia}`

        return sale[0]
    } catch (error) {
        return error
    }
}


async function getInitiatedSaleDetailById(id){

    try {
        const conn = await getConnection()
        const saleDetail = await conn.query(`
            SELECT
                Producto_PK as idProducto,
                Codigo__producto as codigo, 
                CONCAT( Codigo__producto, ' ', Descripcion__producto ) as descripcion,
                Cantidad_piezas_inicio__detalleventa as piezasEntregadas,
                Precio_venta_al_momento__detalleventa as precioVenta,
                Precio_costo_al_momento__detalleventa as precioCosto,
                Cantidad_piezas_por_caja__producto as piezasEnCaja
            FROM detalleventa
            INNER JOIN producto ON Producto_FK__detalleventa = Producto_PK
            INNER JOIN venta ON Venta_FK__detalleventa = Venta_PK
            WHERE Venta_FK__detalleventa = ${id};
        `)
        return saleDetail
    } catch (error) {
        return error
    }
}

async function getAvailableStocks(saleId){
    try {
        const conn = await getConnection()
        const products = await getProducts('code')
        const routesStocks = await conn.query(`
            SELECT  Codigo__producto as code, 
                    SUM(Cantidad_piezas_inicio__detalleventa) as stock
	            FROM detalleventa
                INNER JOIN producto ON Producto_FK__detalleventa = Producto_PK
                WHERE Venta_total__detalleventa IS NULL && Venta_FK__detalleventa != ?
                GROUP BY (Producto_FK__detalleventa) 
                ORDER BY Codigo__producto
        `, saleId)

        
        products.forEach( product => {
            for (let index = 0; index < routesStocks.length; index++) {
                const routeStock = routesStocks[index];
                if (product.codigo == routeStock.code) {
                    product.stock -= routeStock.stock
                }
            }
        });

        return products
    } catch (error) {
        return error
    }
}


async function deleteProductFromSaleDetail(saleId, productId){
    const conn = await getConnection()
    try {
        const deletedProduct = await conn.query('DELETE FROM detalleventa WHERE Venta_FK__detalleventa = ? AND Producto_FK__detalleventa = ?', [saleId, productId])
    } catch (error) {
        return error
    }
}

async function saveShift(shiftData, existentShiftId){
    const conn = await getConnection()
    try {
        if (existentShiftId == -1) {
            const shiftInserted = await conn.query('INSERT INTO turno SET ?', shiftData)
            return shiftInserted.insertId
        }

        const shiftAffected = await conn.query('UPDATE turno SET ? WHERE Turno_PK = ?', [shiftData, existentShiftId])
        return shiftAffected.affectedRows
        
    } catch (error) {
        return error
    }
}

async function saveSaleWithShift(saleData, isNewSale){
    const conn = await getConnection()
    try {
        if (isNewSale) {
            const saleDataInserted = await conn.query('INSERT INTO venta SET ?', saleData)
            return saleDataInserted.insertId    
        }

        const saleDataAffected = await conn.query('UPDATE venta SET ? WHERE Venta_PK = ?', [saleData, saleData.Venta_PK])
        return saleDataAffected.affectedRows
    } catch (error) {
        return error
    }
}

async function saveSaleDetail(saleDetail, isNewSaleDetail){
    const conn = await getConnection()

    try {
        //const saleWithShiftInserted = await conn.query('INSERT INTO venta SET ?', newSaleWithShift)
        for (let index = 1; index <= Object.keys(saleDetail).length; index++) {

            const originalId = saleDetail[index].oldId
            
            delete saleDetail[index].description
            delete saleDetail[index].quantityBoxes
            delete saleDetail[index].code
            delete saleDetail[index].oldId

            if (isNewSaleDetail || typeof originalId != "number")
                await conn.query('INSERT INTO detalleventa SET ?', saleDetail[index])

            else{ 
                await conn.query('UPDATE detalleventa SET ? WHERE Venta_FK__detalleventa = ? AND Producto_FK__detalleventa = ?', [saleDetail[index], saleDetail[index].Venta_FK__detalleventa, originalId])
                
                // if(response.affectedRows == 0)
                //     await conn.query('INSERT INTO detalleventa SET ?', saleDetail[index])
            }
        }

        return 1;
    } catch (error) {
        return error
    }
}

module.exports = {
    getEmployees,
    getRoutes,
    getLastSaleID,
    getAvailableStocks,
    saveShift,
    saveSaleWithShift,
    saveSaleDetail,
    getInitiatedSaleById,
    getInitiatedSaleDetailById,
    deleteProductFromSaleDetail
}