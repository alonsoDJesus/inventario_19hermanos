const mysql = require('promise-mysql')

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'inv_19h'
})

function getConnection() {
    return connection;
}

module.exports = {getConnection}