const { getConnection } = require('../database')

async function getProducts(searchCriteriaDeterminator){
    let searchCriteriaString = ''
    switch (searchCriteriaDeterminator) {
        case 'code':
            searchCriteriaString = 'ORDER BY Codigo__producto'
            break;
        
        case 'stock':
            searchCriteriaString = 'ORDER BY Cantidad_existencias_actual_inventario__producto'
            break;
        
        default:
            searchCriteriaString = `WHERE Codigo__producto = '${searchCriteriaDeterminator}'`
            break;
    }
    try {
        const conn = await getConnection()
        const products = await conn.query(`
            SELECT 
                Producto_PK as id,
                Codigo__producto as codigo,
                Descripcion__producto as descrip,
                Cantidad_piezas_por_caja__producto as piecesInBox,
                Precio_costo__producto as cost,
                Precio_venta__producto as sale,
                Cantidad_existencias_actual_inventario__producto as stock
            FROM producto
            ${searchCriteriaString}
        `)

        products.forEach(product => {
            product.cost = Intl.NumberFormat().format(product.cost)
            product.sale = Intl.NumberFormat().format(product.sale)
        });

        return products
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    getProducts
}