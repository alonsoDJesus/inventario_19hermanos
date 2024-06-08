const { getConnection } = require('../database')

async function getPiecesInitialSales(criteria = ''){
    let searchCriteriaString = criteria != '' ? `AND Fecha_inicio__venta = '${criteria}'` : '';

    const conn = await getConnection()
    const piecesInitialSales = await conn.query(`
        SELECT Venta_FK__detalleventa as id, 
        SUM(Cantidad_piezas_inicio__detalleventa) as cantidad_piezas
        FROM detalleventa
        INNER JOIN venta
        ON Venta_PK = Venta_FK__detalleventa
        WHERE Cantidad_piezas_fin__detalleventa IS NULL ${searchCriteriaString}
        GROUP BY Venta_FK__detalleventa
        ORDER BY Venta_FK__detalleventa DESC;
    `)

    return piecesInitialSales
}

async function getInitialSales(criteria = ''){
    let searchCriteriaString = criteria != '' ? `AND Fecha_inicio__venta = '${criteria}'` : '';

    const conn = await getConnection()
    const initialSales = await conn.query(`
        SELECT 	Venta_PK as id, 
            CONCAT(Nombre__distribuidor, ' ', Apellido_paterno__distribuidor, ' ', Apellido_materno__distribuidor) as nombre, 
            Nombre__ruta as ruta, 
            Fecha_inicio__venta as fecha,
            Hora_inicio__venta as salida
        FROM venta
        INNER JOIN turno ON Turno_FK__venta = Turno_PK
        INNER JOIN distribuidor ON Distribuidor_FK__turno = Distribuidor_PK
        INNER JOIN ruta ON Ruta_FK__turno = Ruta_PK
        WHERE Hora_fin__venta IS NULL ${searchCriteriaString}
        ORDER BY Venta_PK DESC;
        `)

    const piecesOfInitialSales = await getPiecesInitialSales(criteria)
    
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

module.exports = {
    getInitialSales
}