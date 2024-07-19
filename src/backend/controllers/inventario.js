const { getConnection } = require('../database')

async function getProducts(searchCriteriaDeterminator, limitedResults = false){
    let searchCriteriaString = 'WHERE Status_eliminacion__producto = 0'
    switch (searchCriteriaDeterminator) {
        case 'code':
            searchCriteriaString += '\nORDER BY Codigo__producto'
            break;
        
        case 'stock':
            searchCriteriaString += '\nORDER BY Cantidad_existencias_actual_inventario__producto'
            break;
        
        default:
            searchCriteriaString += ` AND Codigo__producto = '${searchCriteriaDeterminator}'`
            break;
    }
    try {
        const conn = await getConnection()

        let query = `
            SELECT 
                Producto_PK as id,
                Codigo__producto as codigo,
                Descripcion__producto as descrip,
                Cantidad_piezas_por_caja__producto as piecesInBox,
                Precio_costo__producto as cost,
                Precio_venta__producto as sale,
                Cantidad_existencias_actual_inventario__producto as stock,
                Cantidad_existencias_maximas_inventario__producto as maxStock,
                Cantidad_existencias_minimas_inventario__producto as minStock
            FROM producto
            ${searchCriteriaString}
        `

        if (limitedResults) {
            query += '\nLIMIT 20'
        }
        
        const products = await conn.query(query)

        
        return products
    } catch (error) {
        return error
    }
}

async function updateProductToSetAsUnavailable(productId){
    try {
        const conn = await getConnection() 
        const response = await conn.query(
            `UPDATE producto SET 
                Status_eliminacion__producto = 1, 
                Codigo__producto = CONCAT('*', Codigo__producto),
                Cantidad_existencias_actual_inventario__producto = 0 
            WHERE Producto_PK = ?;`
            , productId)
        return response.affectedRows
    } catch (error) {
        return error
    }
}

module.exports = {
    getProducts,
    updateProductToSetAsUnavailable
}