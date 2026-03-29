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
        const sql = `SELECT user_id FROM users WHERE username = ?`;
        const values = [username];
        const [rows] = await pool.execute(sql, [username]);
        return rows[0].user_id;
    } catch (error) {
        console.error(error);
    }
}

async function createPost(username, description, tags, location, latitude, longitude) {
    try {
        let userId = await getUserByUsername(username);
        const sql = `INSERT INTO posts(user_id, description, tags, location, latitude, longitude, creation_date) VALUES(${userId},"${description}","${tags}","${location}",${latitude}, ${longitude}, NOW())`;
        const [rows, fields] = await pool.execute(sql);
        return [rows, fields];
    } catch (error) {
        console.error(error);
    }
}
///////EZ új
async function createComment(userId, postId, commentContent) {
    try {
        const sql = 'INSERT INTO comments(user_id, post_id, comment_content) VALUES(?, ?, ?);';
        const [rows] = await pool.execute(sql, [userId, postId, commentContent]);
        return rows;
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
        const userSql = `SELECT users.username, users.profile_picture_link FROM users WHERE users.user_id = ?`;
        let userInfos = await pool.execute(userSql, [user]);
        userInfos = userInfos[0][0];

        const postSql = `SELECT description, tags, upvote, downvote, location, latitude, longitude, unix_timestamp(creation_date) as unix_date FROM posts LEFT JOIN interactions ON posts.post_id = interactions.post_id WHERE posts.post_id = ?`;
        let postInfos = await pool.execute(postSql, [postId]);
        postInfos = postInfos[0][0];

        const pictureSql = `SELECT picture_link FROM pictures WHERE post_id = ?`;
        let pictureInfos = await pool.execute(pictureSql, [postId]);
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

//!LIKE DISLIKE
async function isLiked(username, postId) {
    try {
        let userId = await getUserByUsername(username);
        const sql = `SELECT * FROM interactions WHERE interactions.user_id = ? AND interactions.post_id = ?;`;
        const [rows] = await pool.execute(sql, [userId, postId]);
        return rows[0];
    } catch (error) {
        console.error(error);
    }
}

async function like(username, postId, likeValue, dislikeValue) {
    try {
        let userId = await getUserByUsername(username);
        let likedRow = await isLiked(username, postId);
        if (likedRow == undefined) {
            const sql = `INSERT INTO interactions(user_id, post_id, upvote, downvote) VALUES(?, ?, ?, ?)`;
            await pool.execute(sql, [userId, postId, likeValue, dislikeValue]);
            return 'success';
        } else {
            const sql = `
            UPDATE interactions
            SET upvote = ?, downvote = ?
            WHERE interaction_id = ?;
            `;
            await pool.execute(sql, [likeValue, dislikeValue, likedRow.interaction_id]);
            return 'success';
        }
        return 'failed';
    } catch (error) {
        console.error(error);
    }
}

//like('test', 1, true, false);

//post sorbarendezés lekérdezásek
async function topPosts(timeFrame, offset) {
    try {
        let result = [];

        const topPostsSql = `
        SELECT posts.post_id, posts.description, posts.tags, posts.location, posts.latitude, posts.longitude, posts.creation_date, users.username, users.profile_picture_link
        FROM posts 
        LEFT JOIN users ON users.user_id = posts.user_id 
        LEFT JOIN interactions ON interactions.post_id = posts.post_id 
        WHERE posts.creation_date > NOW() - INTERVAL ? DAY
        GROUP BY posts.post_id
        ORDER BY COUNT(interactions.upvote) - COUNT(interactions.downvote) DESC
        LIMIT 50 OFFSET ?;
        `;
        result = await pool.execute(topPostsSql, [timeFrame, offset]);
        return await postPictures(result[0]);
    } catch (error) {
        console.error(error);
    }
}

topPosts(0);

async function postPictures(posts) {
    try {
        if (posts.length == 0) return null;
        let result = posts;

        //? Eltároljuk az összes id-t
        let postIds = [];

        //? Eltároljuk, hogy hány id lesz
        let queryPlaceholder = '';

        for (let i = 0; i < posts.length; i++) {
            postIds.push(posts[i].post_id);

            //? Ha az utolsó postnál tartunk nem rakunk vesszőt a ? után
            if (i != posts.length - 1) {
                queryPlaceholder += '?,';
            } else {
                queryPlaceholder += '?';
            }
        }

        //? Az IN kb úgy működik mintha sok OR lenne tehát post_id = 1 OR post_id = 2 HELYETT post_id IN (1,2)
        //! ITT NEM BAJ HOGY NEM PARAMÉTERES A "queryPlaceholder" MERT AZT MI CSINÁLJUK (asszem emiatt, or idunno)
        const sql = `
            SELECT post_id, picture_link
            FROM pictures
            WHERE post_id IN (${queryPlaceholder});
            `;

        const [rows] = await pool.execute(sql, postIds);

        //? Eltároljuk a linkeket egy object-ben
        let links = {};
        for (const row of rows) {
            //? ha az adott id-val még nincs semmi akkor lesz egy array, majd abba belepusholjuk az éppen soron lévő linket
            if (links[row.post_id] == undefined) {
                links[row.post_id] = [];
            }
            links[row.post_id].push(row.picture_link);
        }

        //? Hozzárendeljük a posztokhoz a linkeket
        for (const post of result) {
            post['links'] = links[post.post_id];
        }

        return result;
    } catch (error) {
        console.error(error);
    }
}

///////

//profil felület lekérd, comment lekérd, isadmin lekérd,

async function loadProfile(username) {
    try {
        let userId = await getUserByUsername(username);

        const profileSql = `SELECT users.username, users.profile_picture_link, users.biography, users.registration_date, users.email FROM users WHERE users.user_id = ?;`;
        const [rows] = await pool.execute(profileSql, [userId]);
        return rows;
    } catch (error) {
        console.error(error);
    }
}

async function loadComments(postId) {
    try {
        const commentsSql = `
        SELECT users.username, users.profile_picture_link, comments.comment_content, comments.comment_date
        FROM comments 
        INNER JOIN users ON users.user_id = comments.user_id 
        INNER JOIN posts ON posts.post_id = comments.post_id 
        WHERE comments.post_id = ?`;
        const [rows] = await pool.execute(commentsSql, [postId]);
        return rows;
    } catch (error) {
        console.error(error);
    }
}

async function isAdmin(userName) {
    try {
        const adminSql = `SELECT users.is_admin FROM users WHERE users.username = ?`;
        const [rows] = await pool.execute(adminSql, [userName]);
        return rows[0].is_admin;
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

async function deletePost(postId) {
    try {
        const sql = `
        DELETE FROM posts
        WHERE post_id = ?
        `;
        const [rows] = await pool.execute(sql, [postId]);
        return rows.affectedRows;
    } catch (error) {
        throw new Error(error);
    }
}

async function adminProfiles() {
    try {
        const sql = `
        SELECT users.user_id, users.username, users.username, users.email, users.registration_date, COUNT(DISTINCT posts.post_id) AS post_count, COUNT(DISTINCT comments.comment_id) AS comment_count, users.is_admin, users.is_reported
        FROM users 
        LEFT JOIN posts ON users.user_id = posts.user_id 
        LEFT JOIN comments ON users.user_id = comments.user_id
        GROUP BY users.user_id;`;
        const [rows] = await pool.execute(sql);
        return rows;
    } catch (error) {
        throw new Error(error);
    }
}
async function adminPosts() {
    try {
        const sql = `
        SELECT posts.post_id, users.username, posts.creation_date, COUNT(interactions.upvote) AS upvote, COUNT(interactions.downvote) AS downvote, COUNT(pictures.picture_id) AS picture_count, posts.is_reported
        FROM posts 
        LEFT JOIN users ON posts.user_id = users.user_id
        LEFT JOIN interactions ON posts.post_id = interactions.post_id
        LEFT JOIN pictures ON posts.post_id = pictures.post_id
        GROUP BY posts.post_id;`;
        const [rows] = await pool.execute(sql);
        return rows;
    } catch (error) {
        throw new Error(error);
    }
}
async function adminComments() {
    try {
        const sql = `
        SELECT comments.comment_id, comments.post_id, users.username, comments.comment_content, comments.comment_date, comments.is_reported
        FROM comments
        LEFT JOIN users ON comments.user_id = users.user_id;`;
        const [rows] = await pool.execute(sql);
        return rows;
    } catch (error) {
        throw new Error(error);
    }
}

async function userComments(userId) {
    try {
        const sql = `
        SELECT comments.comment_id, comments.comment_content, comments.is_reported
        FROM comments
        WHERE comments.user_id = ?;`;

        const [rows] = await pool.execute(sql, [userId]);
        return rows;
    } catch (error) {
        throw new Error(error);
    }
}

async function userPosts(userId) {
    try {
        const sql = `
        SELECT posts.post_id, posts.description, posts.is_reported
        FROM posts
        WHERE posts.user_id = ?;`;
        const [rows] = await pool.execute(sql, [userId]);
        return rows;
    } catch (error) {
        throw new Error(error);
    }
}

async function adminProfileData(userId) {
    try {
        const sql = `
        SELECT users.user_id, users.username, users.email, users.profile_picture_link, users.biography, users.registration_date, users.is_reported, users.is_admin
        FROM users
        WHERE users.user_id = ?;`;
        const [rows] = await pool.execute(sql, [userId]);
        return rows;
    } catch (error) {
        throw new Error(error);
    }
}

async function updateProfile(userId, username, regDate, email, bio) {
    try {
        const sql = `
        UPDATE users
        SET users.username = ?, users.email = ?, users.biography = ?, users.registration_date = ?
        WHERE users.user_id = ?;
        `;
        await pool.execute(sql, [username, email, bio, regDate, userId]);
        return 'Success';
    } catch (error) {
        throw new Error(error);
    }
}

async function deleteProfile(userId) {
    try {
        const sql = `
        DELETE FROM users
        WHERE users.user_id = ?;
        `;
        await pool.execute(sql, [userId]);
        return 'Success';
    } catch (error) {
        throw new Error(error);
    }
}

async function clearProfile(userId) {
    try {
        const sql = `
        UPDATE users
        SET users.is_reported = false
        WHERE users.user_id = ?;
        `;
        await pool.execute(sql, [userId]);
        return 'Success';
    } catch (error) {
        throw new Error(error);
    }
}

async function clearPost(postId) {
    try {
        const sql = `
        UPDATE posts
        SET posts.is_reported = false
        WHERE posts.post_id = ?;
        `;
        await pool.execute(sql, [postId]);
        return 'Success';
    } catch (error) {
        throw new Error(error);
    }
}

async function adminPostData(postId) {
    try {
        const sql = `
        SELECT users.user_id, users.username, posts.post_id, posts.description, posts.tags, posts.location, posts.latitude, posts.longitude, posts.creation_date, posts.is_reported, pictures.picture_link
        FROM posts
        LEFT JOIN users ON posts.user_id = users.user_id
        LEFT JOIN pictures ON posts.post_id = pictures.post_id
        WHERE posts.post_id = ?;`;
        const [rows] = await pool.execute(sql, [postId]);
        return rows;
    } catch (error) {
        throw new Error(error);
    }
}

async function updatePost(postId, description, creationDate, lat, locationName, lon, tags) {
    try {
        if (lat == '' || lon == '') {
            const sql = `
        UPDATE posts
        SET posts.description = ?, posts.tags = ?, posts.location = ?, posts.creation_date = ? 
        WHERE posts.post_id = ?;
        `;
            await pool.execute(sql, [description, tags, locationName, creationDate, postId]);
            return 'Success';
        } else {
            const sql = `
            UPDATE posts
            SET posts.description = ?, posts.tags = ?, posts.location = ?, posts.latitude = ?, posts.longitude = ?, posts.creation_date = ? 
            WHERE posts.post_id = ?;
            `;
            await pool.execute(sql, [
                description,
                tags,
                locationName,
                lat,
                lon,
                creationDate,
                postId
            ]);
            return 'Success';
        }
    } catch (error) {
        throw new Error(error);
    }
}

async function adminCommentData(commentId) {
    try {
        const sql = `
        SELECT users.username, comments.user_id, comments.post_id, comments.comment_content, comments.comment_date
        FROM comments
        INNER JOIN users ON comments.user_id = users.user_id
        WHERE comments.comment_id = ?;
        `;
        const [rows] = await pool.execute(sql, [commentId]);
        return rows;
    } catch (error) {
        throw new Error(error);
    }
}

async function updateComment(commentId, commentDate, commentContent) {
    try {
        const sql = `
            UPDATE comments
            SET comments.comment_content = ?, comments.comment_date = ?
            WHERE comments.comment_id = ?;
            `;
        await pool.execute(sql, [commentContent, commentDate, commentId]);
        return 'Success';
    } catch (error) {
        throw new Error(error);
    }
}

async function deleteComment(commentId) {
    try {
        const sql = `
        DELETE FROM comments
        WHERE comments.comment_id = ?;
        `;
        await pool.execute(sql, [commentId]);
        return 'Success';
    } catch (error) {
        throw new Error(error);
    }
}

async function clearComment(commentId) {
    try {
        const sql = `
        UPDATE comments
        SET comments.is_reported = false
        WHERE comments.comment_id = ?;
        `;
        await pool.execute(sql, [commentId]);
        return 'Success';
    } catch (error) {
        throw new Error(error);
    }
}

async function searchUser(username) {
    try {
        const sql = `
        SELECT user_id, username, profile_picture_link
        FROM users
        WHERE username LIKE ?;
        `;
        const [rows] = await pool.execute(sql, [`%${username}%`]);
        return rows;
    } catch (error) {
        throw new Error(error);
    }
}
async function markers() {
    try {
        const sql = `
        SELECT posts.post_id, latitude, longitude, picture_link
        FROM posts
        LEFT JOIN pictures ON posts.post_id = pictures.post_id
        WHERE latitude IS NOT NULL AND longitude IS NOT NULL;`;
        const [rows] = await pool.execute(sql);
        return rows;
    } catch (error) {
        throw new Error(error);
    }
}

async function createChat(userIds, imageName, chatName) {
    try {
        console.log(userIds);
        console.log(imageName);
        console.log(chatName);
        const sql1 = `
        INSERT INTO chats(chat_name, chat_picture_link)
        VALUES(?,?)
        `;
        const [fields] = await pool.execute(sql1, [chatName, imageName]);
        let chatId = fields.insertId;
        //console.log(chatId);
        //console.log(userIds);

        try {
            for (let i = 0; i < userIds.length; i++) {
                const sql2 = `
            INSERT INTO chat_members(chat_id, user_id)
            VALUES(?,?)
            `;
                let asd = await pool.execute(sql2, [chatId, userIds[i]]);
            }
            return 'Success';
        } catch (error) {
            console.log('HIBA ITT 2.');
            //console.log(error);
        }
    } catch (error) {
        //throw new Error(error);
    }
}
async function favoritePost(username, postId, favoriteValue) {
    try {
        let userId = await getUserByUsername(username);
        if (favoriteValue) {
            const sql = `
            INSERT INTO favorites(post_id, user_id, is_favorited)
            VALUES(?,?,?)
            `;
            await pool.execute(sql, [postId, userId, favoriteValue]);
        } else {
            const sql = `
            DELETE FROM favorites
            WHERE post_id = ? AND user_id = ?;
            `;
            await pool.execute(sql, [postId, userId]);
        }
        return 'success';
    } catch (error) {
        throw new Error(error);
    }
}
async function appendPictures(posts) {
    for (const post of posts) {
        const picSql = `
            SELECT pictures.picture_link
            FROM pictures
            WHERE pictures.post_id = ?;`;
        const [rows] = await pool.execute(picSql, [post.post_id]);
        post['pictures'] = rows;
    }
    return posts;
}

async function userPosted(username) {
    try {
        const userId = await getUserByUsername(username);
        const sql = `
        SELECT posts.post_id, posts.description, posts.tags, posts.location, posts.creation_date
        FROM posts
        WHERE user_id = ?;`;

        let posts = await pool.execute(sql, [userId]);
        posts = await appendPictures(posts[0]);

        return posts;
    } catch (error) {
        console.log(error);
    }
}

async function userLiked(username) {
    try {
        const userId = await getUserByUsername(username);
        const interactionSql = `
    SELECT post_id
    FROM interactions
    WHERE user_id = ? AND upvote = 1;`;

        let posts = [];

        const postIds = await pool.execute(interactionSql, [userId]);
        for (const id of postIds[0]) {
            let postSql = `
        SELECT posts.post_id, posts.description, posts.tags, posts.location, posts.creation_date
        FROM posts
        WHERE post_id = ?;`;

            let post = await pool.execute(postSql, [id.post_id]);
            posts.push(post[0][0]);
        }

        posts = await appendPictures(posts);
        return posts;
    } catch (error) {
        console.log(error);
    }
}

async function userDisliked(username) {
    try {
        const userId = await getUserByUsername(username);
        const interactionSql = `
    SELECT post_id
    FROM interactions
    WHERE user_id = ? AND downvote = 1;`;

        let posts = [];

        const postIds = await pool.execute(interactionSql, [userId]);
        for (const id of postIds[0]) {
            let postSql = `
        SELECT posts.post_id, posts.description, posts.tags, posts.location, posts.creation_date
        FROM posts
        WHERE post_id = ?;`;

            let post = await pool.execute(postSql, [id.post_id]);
            posts.push(post[0][0]);
        }

        posts = await appendPictures(posts);
        return posts;
    } catch (error) {
        console.log(error);
    }
}

async function userSaved(username) {
    try {
        const userId = await getUserByUsername(username);
        const interactionSql = `
        SELECT post_id
        FROM favorites
        WHERE user_id = ? AND is_favorited = 1;`;

        let posts = [];

        const postIds = await pool.execute(interactionSql, [userId]);
        for (const id of postIds[0]) {
            let postSql = `
            SELECT posts.post_id, posts.description, posts.tags, posts.location, posts.creation_date
            FROM posts
            WHERE post_id = ?;`;

            let post = await pool.execute(postSql, [id.post_id]);
            posts.push(post[0][0]);
        }

        posts = await appendPictures(posts);
        console.log(posts);
        return posts;
    } catch (error) {
        console.log(error);
    }
}

async function updateProfileName(username, newUsername) {
    try {
        const userId = await getUserByUsername(username);

        const sql = `
        UPDATE users
        SET username = ?
        WHERE user_id = ?;`;

        await pool.execute(sql, [newUsername, userId]);
        return 'success';
    } catch (error) {
        console.log(error);
    }
}

async function updateProfileBiography(username, biography) {
    try {
        const userId = await getUserByUsername(username);

        const sql = `
        UPDATE users
        SET biography = ?
        WHERE user_id = ?;`;

        await pool.execute(sql, [biography, userId]);
        return 'success';
    } catch (error) {
        console.log(error);
    }
}

async function updateProfilePicture(username, profileLink) {
    try {
        const userId = await getUserByUsername(username);

        const sql = `
        UPDATE users
        SET profile_picture_link = ?
        WHERE user_id = ?;`;

        await pool.execute(sql, [profileLink, userId]);
        return 'success';
    } catch (error) {
        console.log(error);
    }
}

async function isFavorited(postId, username) {
    try {
        let userId = await getUserByUsername(username);
        const sql = `
        SELECT is_favorited 
        FROM favorites
        WHERE post_id = ? AND user_id = ?;`;
        const [rows] = await pool.execute(sql, [postId, userId]);
        return rows[0];
    } catch (error) {
        throw new Error(error);
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
    sendMessage,
    deletePost,
    adminProfiles,
    adminPosts,
    adminComments,
    userComments,
    userPosts,
    adminProfileData,
    updateProfile,
    deleteProfile,
    clearProfile,
    adminPostData,
    clearPost,
    updatePost,
    adminCommentData,
    updateComment,
    deleteComment,
    clearComment,
    searchUser,
    createChat,
    markers,
    userPosted,
    userLiked,
    userDisliked,
    userSaved,
    updateProfilePicture,
    updateProfileName,
    updateProfileBiography,
    createComment,
    isLiked,
    like,
    favoritePost,
    isFavorited
};
