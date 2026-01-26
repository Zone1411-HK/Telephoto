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

async function createPicture(postId, pictureLink) {
    try {
        const sql = `INSERT INTO pictures(post_id, picture_link) VALUES (${postId}, "${pictureLink}")`;
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

//profil felület lekérd, comment lekérd, isadmin lekérd, 

async function loadProfile(userId) {    
    try {
        const profileSql = `SELECT users.username, users.profile_picture_link, users.biography, users.registration_date FROM users WHERE users.user_id = ${userId}`;
        const [rows] = await pool.execute(profileSql);
        return rows;
    } catch (error) {
        console.error(error);
    }
}

async function loadComments(postId) {    
    try {
        const commentsSql = `SELECT users.username, users.profile_picture_link, interactions.comment_content FROM interactions INNER JOIN users ON users.user_id = interactions.user_id INNER JOIN posts ON posts.post_id = interactions.post_id WHERE interactions.post_id = ${postId}`;
        const [rows] = await pool.execute(commentsSql);
        return rows;
    } catch (error) {
        console.error(error);
    }
}

async function isAdmin(userName) {    
    try {
        const adminSql = `SELECT users.is_admin FROM users WHERE users.iusername = ${userName}`;
        const [rows] = await pool.execute(adminSql);
        return rows;
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
    getPostDataByPostId,
    createPicture,
    loadProfile,
    loadComments,
    isAdmin
};
