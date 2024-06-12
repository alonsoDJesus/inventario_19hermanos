const { getConnection } = require('../database')

async function getSaleById(id){

    try {
        const conn = await getConnection()
        const sale = await conn.query(`
            SELECT
                CONCAT(Nombre__distribuidor, ' ', Apellido_paterno__distribuidor, ' ', Apellido_materno__distribuidor) as nombre,
                Nombre__ruta as ruta,
                Fecha_inicio__venta as fecha,
                Hora_inicio__venta as salida
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
                Descripcion__producto as descripcion,
                Cantidad_piezas_inicio__detalleventa as piezasEntregadas,
                Precio_venta_al_momento__detalleventa as precioVenta,
                Precio_costo_al_momento__detalleventa as precioCosto
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