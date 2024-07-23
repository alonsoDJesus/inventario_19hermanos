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

async function saveProduct(productData, isUpdate){
    const query = isUpdate ? 'UPDATE producto SET ? WHERE Producto_PK = ?' : 'INSERT INTO producto SET ?'
    const queryParams = isUpdate ? [productData, productData.Producto_PK] : productData

    try {
        const conn = await getConnection()
        const response = await conn.query(query, queryParams)

        return isUpdate ? response.affectedRows : response.insertId
    } catch (error) {
        return error
    }
}

module.exports = {
    existsProductWithCode,
    saveProduct
}