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

async function findUserOfPost(postId) {
    try {
        const sql = `SELECT posts.user_id FROM posts WHERE posts.post_id = ${postId} `;
        const [rows] = await pool.execute(sql);
        let user = rows[0].user_id;
        return user;
    } catch (error) {
        console.error(error);
    }
}

async function getPostDataByPostId(postId) {
    try {
        let user = await findUserOfPost(postId);
        const userSql = `SELECT users.username, users.profile_picture_link FROM users WHERE users.user_id = ${user}`;
        let userInfos = await pool.execute(userSql);
        userInfos = userInfos[0][0];

        const postSql = `SELECT description, tags, upvote, downvote, location, latitude, longitude, unix_timestamp(creation_date) as unix_date FROM posts WHERE post_id = ${postId}`;
        let postInfos = await pool.execute(postSql);
        postInfos = postInfos[0][0];

        const pictureSql = `SELECT picture_link FROM pictures WHERE post_id = ${postId}`;
        let pictureInfos = await pool.execute(pictureSql);
        pictureInfos = pictureInfos[0];
        pictureArray = [];
        pictureInfos.forEach((picture) => {
            pictureArray.push(picture.picture_link);
        });

        return { userInfos: userInfos, postInfos: postInfos, pictureInfos: pictureArray };
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
    createPost,
    getPostDataByPostId
};
