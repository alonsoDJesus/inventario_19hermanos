const { getConnection } = require('../database')

async function getCompletedSales(criteria = ''){
    let searchCriteriaString = criteria != '' ? `AND Fecha_inicio__venta = '${criteria}'` : '';

    const conn = await getConnection()
    const completedSales = await conn.query(`
        SELECT 	Venta_PK as id, 
                CONCAT(Nombre__distribuidor, ' ', Apellido_paterno__distribuidor, ' ', Apellido_materno__distribuidor) as nombre, 
                Codigo__ruta as ruta,
                Fecha_inicio__venta as fecha, 
                Hora_inicio__venta as salida,
                Hora_registro__venta as llegada,
                Venta_total_global__venta as venta,
                Costo_total_global__venta as costo,
                Utilidad_total_global__venta as utilidad
        FROM venta
        INNER JOIN turno ON Turno_FK__venta = Turno_PK
        INNER JOIN distribuidor ON Distribuidor_FK__turno = Distribuidor_PK
        INNER JOIN ruta ON Ruta_FK__turno = Ruta_PK
        WHERE Venta_total_global__venta IS NOT NULL ${searchCriteriaString}
        ORDER BY Venta_PK DESC;
    `)

    completedSales.forEach(sale => {
        sale.venta = Intl.NumberFormat().format(sale.venta)
        sale.costo = Intl.NumberFormat().format(sale.costo)
        sale.utilidad = Intl.NumberFormat().format(sale.utilidad)

        let fecha = new Date(sale.fecha)
        dia = fecha.getDate()
        mes = fecha.getMonth()
        anio = fecha.getFullYear()

        dia = dia >= 1 && dia < 10 ? `0${dia}` : `${dia}`
        mes = mes >= 0 && mes < 10 ? `0${mes + 1}` : `${mes + 1}`
        sale.fecha = `${dia}/${mes}/${anio}`
    });

    return completedSales
}

module.exports = {
    getCompletedSales,
}