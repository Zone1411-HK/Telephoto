const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'telephoto',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

//!SQL Queries
async function selectall() {
    const query = 'SELECT * FROM users;';
    const [rows] = await pool.execute(query);
    return rows;
}

async function addNewUser(username, salt, hash, email) {
    try {
        //! OTT ROHADJON MEG AZ IDÉZŐJEL A VALUESBAN
        const sql = `INSERT INTO users(username, password_salt, password_hash, email) VALUES("${username}", "${salt}", "${hash}", "${email}")`;
        const [result, fields] = await pool.execute(sql);
        return [result, fields];
    } catch (error) {
        console.error(error);
    }
}

async function loginSelect() {
    const query = 'SELECT username, password_salt, password_hash FROM users';
    const [rows] = await pool.execute(query);
    return rows;
}
//!Export
module.exports = {
    selectall,
    addNewUser,
    loginSelect
};
