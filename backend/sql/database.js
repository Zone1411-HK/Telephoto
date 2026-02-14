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

async function getUserByUsername(username) {
    try {
        const sql = `SELECT user_id FROM users WHERE username LIKE ?`;
        const values = [username];
        const [rows] = await pool.execute(sql, values);
        return rows[0].user_id;
    } catch (error) {
        console.error(error);
    }
}

async function createPost(username, description, tags, location, latitude, longitude) {
    try {
        let userId = await getUserByUsername(username);
        console.log(userId);
        const sql = `INSERT INTO posts(user_id, description, tags, location, latitude, longitude, creation_date) VALUES(${userId},"${description}","${tags}","${location}",${latitude}, ${longitude}, NOW())`;
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

//post sorbarendezés lekérdezásek
async function topPosts() {
    try {
        const topPostsSql = `SELECT posts.post_id, posts.description, posts.tags, posts.location, posts.latitude, posts.longitude, posts.creation_date, users.username, users.profile_picture_link, pictures.picture_link FROM posts LEFT JOIN users ON users.user_id = posts.user_id LEFT JOIN interactions ON interactions.post_id = posts.post_id LEFT JOIN pictures ON pictures.post_id = posts.post_id ORDER BY interactions.upvote_downvote`;
        const [rows] = await pool.execute(topPostsSql);
        console.log(rows);
        return rows;
    } catch (error) {
        console.error(error);
    }
}

///////

//profil felület lekérd, comment lekérd, isadmin lekérd,

async function loadProfile(username) {
    try {
        let userId = await getUserByUsername(username);

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

async function allUsername() {
    try {
        const sql = 'SELECT users.username FROM users';
        const [rows] = await pool.execute(sql);
        return rows;
    } catch (error) {
        console.error('SQL ERROR: allUsername: ' + error);
    }
}

//? Egy adott usernek az üzenetei
async function messagesByUser(username) {
    let userId = await getUserByUsername(username);
    const sql = `
    SELECT users.username, users.profile_picture_link, messages.message, messages.message_date, chat_members.chat_id 
    FROM messages
    INNER JOIN chat_members ON messages.member_id = chat_members.member_id
    INNER JOIN users ON chat_members.user_id = users.user_id
    WHERE users.user_id = ?;`;
    const values = [userId];
    const [rows] = await pool.execute(sql, values);
    return rows;
}
async function chatInfoByChatId(chatId) {
    try {
        const sql = `SELECT chats.chat_id, chats.chat_name, chats.chat_picture_link FROM chats WHERE chats.chat_id = ?;`;
        const values = [chatId];
        const [rows] = await pool.execute(sql, values);
        return rows[0];
    } catch (error) {
        console.error(error);
    }
}

//? Egy adott chatnek a tagjai

async function usersOfChat(chatId) {
    try {
        const values = [chatId];
        const sql = `
        SELECT users.username
        FROM chat_members 
        INNER JOIN users ON chat_members.user_id = users.user_id
        INNER JOIN chats ON chat_members.chat_id = chats.chat_id
        WHERE chats.chat_id = ?;`;
        const [rows] = await pool.execute(sql, values);
        return rows;
    } catch (error) {
        console.error(error);
    }
}

//? Egy adott usernek a chatjei

async function chatsOfUser(username) {
    try {
        const userId = await getUserByUsername(username);
        const sql = `
        SELECT chats.chat_id, chats.chat_name, chats.chat_picture_link
        FROM chat_members 
        INNER JOIN chats ON chat_members.chat_id = chats.chat_id
        WHERE chat_members.user_id = ?;
        `;
        const values = [userId];
        const [rows] = await pool.execute(sql, values);
        return rows;
    } catch (error) {
        console.error(error);
    }
}

//? Egy adott chatnek az üzenetei
async function messagesOfChat(chatId) {
    try {
        const values = [chatId];
        const sql = `
        SELECT users.username, messages.message, messages.message_date  
        FROM messages 
        INNER JOIN chat_members ON messages.member_id = chat_members.member_id
        INNER JOIN users ON chat_members.user_id = users.user_id
        WHERE chat_members.chat_id = ?
        ORDER BY messages.message_date;
        `;
        const [rows] = await pool.execute(sql, values);
        return rows;
    } catch (error) {
        console.error(error);
    }
}

async function lastMessageOfChat(chatId) {
    try {
        const values = [chatId];
        const sql = `
        SELECT users.username, messages.message, messages.message_date  
        FROM messages 
        INNER JOIN chat_members ON messages.member_id = chat_members.member_id
        INNER JOIN users ON chat_members.user_id = users.user_id
        WHERE chat_members.chat_id = ?
        ORDER BY messages.message_date DESC
        LIMIT 1;
        `;
        const [rows] = await pool.execute(sql, values);
        return rows;
    } catch (error) {
        console.error(error);
    }
}

async function findMemberId(chat_id, user_id) {
    const sql = `
    SELECT member_id 
    FROM chat_members
    WHERE chat_id = ? AND user_id = ?
    `;
    const [rows] = await pool.execute(sql, [chat_id, user_id]);
    return rows[0].member_id;
}

async function sendMessage(message, chatId, username) {
    try {
        const user = await getUserByUsername(username);
        console.log(user);
        const member_id = await findMemberId(chatId, user);
        const values = [member_id, message];
        const sql = `
        INSERT INTO messages(member_id, message, message_date)
        VALUES(?, ?, NOW())
        `;
        const [fields] = await pool.execute(sql, [member_id, message]);
        return fields;
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
    topPosts,
    loadProfile,
    loadComments,
    isAdmin,
    allUsername,
    messagesByUser,
    chatInfoByChatId,
    usersOfChat,
    chatsOfUser,
    messagesOfChat,
    lastMessageOfChat,
    findMemberId,
    sendMessage
};
