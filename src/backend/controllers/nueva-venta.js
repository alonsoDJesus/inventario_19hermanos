const { getConnection } = require('../database')

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

async function getInitiatedSaleById(id){

    try {
        const conn = await getConnection()
        const sale = await conn.query(`
            SELECT
                CONCAT(Nombre__distribuidor, ' ', Apellido_paterno__distribuidor, ' ', Apellido_materno__distribuidor) as nombre,
                Codigo__ruta as codigoRuta,
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
        return error
    }
}

module.exports = {
    getEmployees,
    getRoutes,
    getLastSaleID,
    setNewShift,
    setNewSaleWithShift,
    setSaleDetail,
    getInitiatedSaleById
}