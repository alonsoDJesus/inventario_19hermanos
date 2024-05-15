const { getConnection } = require('../database')

async function getSaleById(id){

    try {
        const conn = await getConnection()
        const sale = await conn.query(`
            SELECT
                CONCAT(Nombre__distribuidor, ' ', Apellido_paterno__distribuidor, ' ', Apellido_materno__distribuidor) as nombre,
                Nombre__ruta as ruta,
                Fecha__venta as fecha,
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


module.exports = {
    getSaleById
}