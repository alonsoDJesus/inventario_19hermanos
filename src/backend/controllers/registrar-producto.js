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

async function setNewProduct(productData){

    try {
        const conn = await getConnection()
        const productInserted = await conn.query(`INSERT INTO producto SET ?`, productData)

        return productInserted.insertId
    } catch (error) {
        return error
    }
}

module.exports = {
    existsProductWithCode,
    setNewProduct
}