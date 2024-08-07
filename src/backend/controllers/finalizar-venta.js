const { getConnection } = require('../database')

async function getSaleById(id){

    try {
        const conn = await getConnection()
        const sale = await conn.query(`
            SELECT
                Distribuidor_PK as id,
                Ruta_PK as rutaId,
                Turno_FK__venta as turnoId,
                Fecha_inicio__venta as fecha,
                Cajas_inicio__venta as cajasSalida,
                Cajas_fin__venta as cajasEntrada
            FROM venta 
            INNER JOIN turno ON Turno_FK__venta = Turno_PK
            INNER JOIN distribuidor ON Distribuidor_FK__turno = Distribuidor_PK
            INNER JOIN ruta ON Ruta_FK__turno = Ruta_PK
            WHERE Venta_PK = ${id};
        `)

        let fecha = new Date(sale[0].fecha)
        let dia = fecha.getDate()
        let mes = fecha.getMonth()
        let anio = fecha.getFullYear()

        dia = dia >= 1 && dia < 10 ? `0${dia}` : `${dia}`
        mes = mes >= 0 && mes < 10 ? `0${mes + 1}` : `${mes + 1}`
        sale[0].fecha = `${anio}-${mes}-${dia}`

        return sale[0]
    } catch (error) {
        console.log(error)
    }
}

async function getSaleDetailById(id){

    try {
        const conn = await getConnection()
        const saleDetail = await conn.query(`
            SELECT
                Producto_PK as idProducto,
                Codigo__producto as codigoProducto,
                Descripcion__producto as descripcion,
                Cantidad_piezas_inicio__detalleventa as piezasEntregadas,
                Cantidad_piezas_fin__detalleventa as piezasFinales,
                Cantidad_piezas_vendidas__detalleventa as piezasVendidas,
                Precio_venta_al_momento__detalleventa as precioVenta,
                Precio_costo_al_momento__detalleventa as precioCosto,
                Cantidad_existencias_actual_inventario__producto as stock
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

async function updateSaleById(saleUpdated, id){

    try {
        const conn = await getConnection()
        const saleUpdate = await conn.query(`UPDATE venta SET ? WHERE Venta_PK = ?`, [saleUpdated, id])
        
        return saleUpdate.affectedRows
    } catch (error) {
       
        return error
    }
}

async function updateSaleDetailById(saleUpdated, saleId, productId){

    try {
        const conn = await getConnection()
        const saleDetailUpdate = await conn.query(`
            UPDATE detalleventa SET ? 
            WHERE 
                Venta_FK__detalleventa = ? AND Producto_FK__detalleventa = ?`, 
        [saleUpdated, saleId, productId])

        return saleDetailUpdate.affectedRows
    } catch (error) {
        return error
    }
}

module.exports = {
    getSaleById,
    getSaleDetailById,
    updateSaleById,
    updateSaleDetailById
}