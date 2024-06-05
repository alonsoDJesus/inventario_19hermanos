const { getConnection } = require('../database')

async function existsProductWithCode(productCode){

    try {
        const conn = await getConnection()
        const response = await conn.query(`SELECT EXISTS (SELECT * FROM producto WHERE Codigo__producto = ?)`, productCode)

        return response[0][`EXISTS (SELECT * FROM producto WHERE Codigo__producto = '${productCode}')`]
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    existsProductWithCode
}