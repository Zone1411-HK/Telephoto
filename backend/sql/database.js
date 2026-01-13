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
        const sql = `INSERT INTO users(username, password_salt, password_hash, email, is_admin, registration_date) VALUES("${username}", "${salt}", "${hash}", "${email}", false ,NOW())`;
        await pool.execute(sql);
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

async function getUserByUsername(username) {
    try {
        const sql = `SELECT user_id FROM users WHERE username LIKE "${username}"`;
        const [rows] = await pool.execute(sql);
        return rows;
    } catch (error) {
        console.error(error);
    }
}

async function createPost(username, description, tags, location, latitude, longitude) {
    try {
        let userId = await getUserByUsername(username);
        userId = userId[0].user_id;
        const sql = `INSERT INTO posts(user_id, description, tags, upvote, downvote, location, latitude, longitude, creation_date) VALUES(${userId},"${description}","${tags}",0,0,"${location}",${latitude}, ${longitude}, NOW())`;
        const [rows, fields] = await pool.execute(sql);
        return [rows, fields];
    } catch (error) {
        console.error(error);
    }
}
//!Export
module.exports = {
    selectall,
    addNewUser,
    loginSelect,
    getUserByUsername,
    createPost
};
