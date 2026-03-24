const express = require('express');
const router = express.Router();
const database = require('../sql/database.js');
const fs = require('fs/promises');

const crypto = require('node:crypto');

//!Multer
const multer = require('multer'); //?npm install multer
const path = require('path');

const storage = multer.diskStorage({
    destination: (request, file, callback) => {
        callback(null, path.join(__dirname, '../uploads'));
    },
    filename: (request, file, callback) => {
        callback(null, Date.now() + '-' + file.originalname); //?egyedi név: dátum - file eredeti neve
    }
});

const upload = multer({ storage: storage });

//!Endpoints:
//?GET /api/test
router.get('/test', (request, response) => {
    response.status(200).json({
        message: 'Ez a végpont működik.'
    });
});

//?GET /api/testsql
router.get('/testsql', async (request, response) => {
    try {
        /*
        const loginSelect = await database.loginSelect();
        console.log(loginSelect.length);
        const selectall = await database.selectall(); 
        response.status(200).json({
            message: 'Ez a végpont működik.',
            results: selectall
        });
        const addNewUser = await database.addNewUser('asd', 'a', 'a', 'a');
        console.log(addNewUser);
        const getUserByUsername = await database.getUserByUsername('asd');
        console.log(getUserByUsername);
        const createPost = await database.createPost('asd', 'asd', 'asd', 'asd', 0, 0);
        console.log(await database.getPostDataByPostId(3));
        */
    } catch (error) {
        response.status(500).json({
            message: 'Ez a végpont nem működik.'
        });
    }
});

//! REGISZTRÁCIÓ
//#region registration
router.get('/isUsernameAvailable/:name', async (request, response) => {
    try {
        const name = request.params.name;
        const usernames = await database.allUsername();
        let j = 0;

        while (j < usernames.length && usernames[j].username != name) {
            j++;
        }

        let isAvailable = j == usernames.length ? true : false;
        response.status(200).json({
            available: isAvailable
        });
    } catch (error) {
        response.status(500).json({
            error: `Endpoint ERROR: isUsernameAvailable: ${error}`
        });
    }
});
router.post('/registration', async (request, response) => {
    try {
        const { username, email, password } = request.body;
        const { salt, hash } = HashString(password);
        const addNewUser = await database.addNewUser(username, salt, hash, email);
        response.status(201).json({
            status: 'Successful registration',
            results: addNewUser[0],
            fields: addNewUser[1]
        });
    } catch (error) {
        response.status(500).json({
            error: `Endpoint ERROR: registration: ${error}`
        });
    }
});
//#endregion

//! LOGIN
//#region login
router.post('/login', async (request, response) => {
    try {
        const loginSelect = await database.loginSelect();
        const { username, password } = request.body;
        let isVerified = false;
        let j = 0;
        while (j < loginSelect.length && !isVerified) {
            if (
                loginSelect[j].username == username &&
                VerifyHashedString(
                    password,
                    loginSelect[j].password_salt,
                    loginSelect[j].password_hash
                )
            ) {
                isVerified = true;
            }
            j++;
        }

        if (isVerified) {
            const userId = await database.getUserByUsername(username);
            request.session.username = username;
            request.session.userId = userId;
            response.status(200).json({
                status: 'Successful login',
                isLoggedIn: true
            });
        } else {
            response.status(200).json({
                status: 'Failed login',
                isLoggedIn: false
            });
        }
    } catch (error) {
        response.status(500).json({
            error: `Endpoint ERROR: login: ${error}`
        });
    }
});
//#endregion

//! POSZT FELTÖLTÉS
//#region Posting
router.post('/createPost', async (request, response) => {
    try {
        const { username, fileNames, description, tags, location, latitude, longitude } =
            request.body;
        const createPost = await database.createPost(
            username,
            description,
            tags,
            location,
            latitude,
            longitude
        );
        //console.log(fileNames);
        for (const file of fileNames) {
            await database.createPicture(createPost[0].insertId, file);
        }
        if (createPost[0].affectedRows > 0) {
            clearFolder('../frontend/temp_images');
            response.status(201).json({
                Status: 'Successful post creation',
                Success: true
            });
        } else {
            response.status(500).json({
                Status: 'Failed post creation',
                Success: false
            });
        }
    } catch (error) {
        response.status(500).json({
            error: `Endpoint ERROR: createPost: ${error}`
        });
    }
});

const tempStorage = multer.diskStorage({
    destination: (request, file, callback) => {
        callback(null, path.join(__dirname, '../../frontend/temp_images'));
    },
    filename: (request, file, callback) => {
        callback(null, 'temp-' + file.originalname); //?egyedi név: temp - file eredeti neve
    }
});
const postStorage = multer.diskStorage({
    destination: (request, file, callback) => {
        callback(null, path.join(__dirname, '../uploads'));
    },
    filename: (request, file, callback) => {
        callback(null, Date.now() + '-' + file.originalname); //?egyedi név: dátum - file eredeti neve
    }
});

const tempUpload = multer({ storage: tempStorage });
const postUpload = multer({ storage: postStorage });

router.post('/tempUpload', tempUpload.array('uploadFile'), async (request, response) => {
    try {
        response.status(201).json({
            Message: 'Sikeres feltöltés!',
            filenames: request.files
        });
    } catch (error) {
        response.status(500).json({
            error: `Endpoint ERROR: tempUpload: ${error}`
        });
    }
});

router.post('/uploadPost', postUpload.array('uploadFile'), async (request, response) => {
    try {
        //uploadFiles(postUpload, 'uploadFile');
        response.status(201).json({
            Status: 'Success',
            filenames: request.files
        });
    } catch (error) {
        response.status(500).json({
            Status: 'Failed',
            error: `Endpoint ERROR: uploadPost: ${error}`
        });
    }
});
//#endregion

//komment kreálás + like-dislike
router.post('/uploadComment', async (request, response) => {
    try {
        const { postId, commentContent } = request.body;
        const userId = request.session.userId;
        const createComment = await database.createComment(userId, postId, commentContent);
        response.status(200).json({
            status: 'Success',
            results: createComment
        });
    } catch (error) {
        response.status(500).json({
            message: 'Nem jó',
            error: error.message
        });
        console.log(error);
    }
});

router.get('/interactions/:postId', async (request, response) => {
    try {
        const username = request.session.username;
        //const username = await database.loadProfile(request.session.username);
        const postId = request.params.postId;
        const data = await database.isLiked(username, postId);
        response.status(200).json({
            status: 'Success',
            results: data == undefined ? { upvote: 0, downvote: 0 } : data
        });
    } catch (error) {
        response.status(500).json({
            message: 'Nem jó',
            error: error.message
        });
        console.log(error);
    }
});

router.post('/uploadInteraction', async (request, response) => {
    try {
        const { postId, likeValue, dislikeValue } = request.body;
        const username = request.session.username;
        //const username = await database.loadProfile(request.session.username);
        const likeDislike = await database.like(username, postId, likeValue, dislikeValue);
        response.status(200).json({
            status: likeDislike
            //results: likeDislike
        });
    } catch (error) {
        response.status(500).json({
            message: 'Nem jó',
            error: error.message
        });
        console.log(error);
    }
});

router.post('/favoritePost', async (request, response) => {
    try {
        const { postId, favoriteValue } = request.body;
        const username = request.session.username;
        const feedback = await database.favoritePost(username, postId, favoriteValue);
        response.status(200).json({
            status: feedback
        });
    } catch (error) {
        console.error(error);
        response.status(500).json({
            message: 'Hiba a /favoritePost végpontban',
            error: error
        });
    }
});

router.get('/isFavorited/:postId', async (request, response) => {
    try {
        const postId = request.params.postId;
        const username = request.session.username;
        const isFavorited = await database.isFavorited(postId, username);

        response.status(200).json({
            status: 'success',
            results: isFavorited == undefined ? { is_favorited: 0 } : isFavorited
        });
    } catch (error) {
        console.error(error);
        response.status(500).json({
            message: 'Hiba a /isFavorited végpontban',
            error: error
        });
    }
});

//! ADATOK
//#region Data

//! POSZT ADATOK
router.get('/postInfos/:postId', async (request, response) => {
    try {
        const postId = request.params.postId;
        const { userInfos, postInfos, pictureInfos } = await database.getPostDataByPostId(postId);
        const returnInfos = {
            userInfos: userInfos,
            postInfos: {
                description: postInfos.description,
                tags: postInfos.tags,
                score: postInfos.upvote - postInfos.downvote,
                location: postInfos.location,
                latitude: postInfos.latitude,
                longitude: postInfos.longitude,
                creation_date: convertUnixToReadableDate(postInfos.unix_date * 1000)
            },
            pictureInfos: pictureInfos
        };
        response.status(200).json({
            Status: 'Success',
            Infos: returnInfos
        });
    } catch (error) {
        response.status(500).json({
            error: `Endpoint ERROR: postInfos: ${error}`
        });
    }
});

router.get('/topPosts', async (request, response) => {
    try {
        const data = await database.topPosts();
        //console.log('hiba ' + data);
        response.status(200).json({
            status: 'Success',
            results: data
        });
    } catch (error) {
        console.log(error);
    }
});

//! PROFIL ADATOK (nincs kész)
router.get('/profileInfos', async (request, response) => {
    try {
        const username = request.session.username;
        const data = await database.loadProfile(username);

        response.status(200).json({
            status: 'Success',
            results: data
        });
        //console.log(data);
    } catch (error) {
        console.log(error);
    }
});

router.get('/postsByUser', async (request, response) => {
    try {
        const username = request.session.username;
        const userPosts = await database.userPosted(username);
        console.log(userPosts);
        response.status(200).json({
            Status: 'Success',
            posts: userPosts
        });
    } catch (error) {
        console.log(error);
        response.status(500).json({
            Status: 'Failed',
            Message: error
        });
    }
});
router.get('/likedPosts', async (request, response) => {
    try {
        const username = request.session.username;
        const likedPosts = await database.userLiked(username);

        response.status(200).json({
            Status: 'Success',
            posts: likedPosts
        });
    } catch (error) {
        console.log(error);
        response.status(500).json({
            Status: 'Failed',
            Message: error
        });
    }
});
router.get('/dislikedPosts', async (request, response) => {
    try {
        const username = request.session.username;
        const dislikedPosts = await database.userDisliked(username);

        response.status(200).json({
            Status: 'Success',
            posts: dislikedPosts
        });
    } catch (error) {
        console.log(error);
        response.status(500).json({
            Status: 'Failed',
            Message: error
        });
    }
});
router.get('/savedPosts', async (request, response) => {
    try {
        const username = request.session.username;
        const savedPosts = await database.userSaved(username);

        response.status(200).json({
            Status: 'Success',
            posts: savedPosts
        });
    } catch (error) {
        console.log(error);
        response.status(500).json({
            Status: 'Failed',
            Message: error
        });
    }
});

//! KOMMENT ADATOK
router.get('/commentInfos/:postId', async (request, response) => {
    const postId = request.params.postId;
    const data = await database.loadComments(postId);

    response.status(200).json({
        status: 'Success',
        results: data
    });
    //console.log(data);
});
//#endregion

//! CHAT
//#region Chat
//! FELHASZNÁLÓ CHATJEI
router.get('/chatsOfUser/:username', async (request, response) => {
    try {
        const username = request.params.username;
        const sqlData = await database.chatsOfUser(username);
        response.status(200).json({
            Status: 'Success',
            Result: sqlData
        });
    } catch (error) {
        console.error(error);
        response.status(500).json({
            Status: 'Failed',
            Message: 'A "/chatsOfUser" végpont nem működik!'
        });
    }
});

router.get('/messagesOfChat', async (request, response) => {
    try {
        const chatId = request.session.chatId;
        const sqlData = await database.messagesOfChat(chatId);
        let formattedDataArr = [];
        for (const data of sqlData) {
            const formattedDate = convertUnixToReadableDate(
                Math.floor(data.message_date.getTime())
            );
            formattedDataArr.push({
                username: data.username,
                message: data.message,
                message_date: formattedDate
            });
        }
        response.status(200).json({
            Status: 'Success',
            Result: formattedDataArr
        });
    } catch (error) {
        console.error(error);
        response.status(500).json({
            Status: 'Failed',
            Message: 'A "/messagesOfChat" végpont nem működik!'
        });
    }
});
router.get('/lastMessageOfChat/:chatId', async (request, response) => {
    try {
        const chatId = request.params.chatId;
        const sqlData = await database.lastMessageOfChat(chatId);
        response.status(200).json({
            Status: 'Success',
            Result: sqlData[0]
        });
    } catch (error) {
        console.error(error);
        response.status(500).json({
            Status: 'Failed',
            Message: 'A "/lastMessageOfChat" végpont nem működik!'
        });
    }
});

router.post('/sendMessage', async (request, response) => {
    try {
        const { message, chatId, username } = request.body;
        //console.log(message, chatId);
        const sqlData = await database.sendMessage(message, chatId, username);
        response.status(200).json({
            Status: 'Success'
        });
        //console.log(sqlData);
    } catch (error) {
        console.error(error);
        response.status(500).json({
            Status: 'Failed',
            Message: 'A "/sendMessage" végpont nem működik!'
        });
    }
});
router.post('/saveChatId', async (request, response) => {
    try {
        const { chatId } = request.body;
        //console.log(chatId);
        request.session.chatId = chatId;
        response.status(200).json({
            Status: 'Success'
        });
    } catch (error) {
        console.error(error);
        response.status(500).json({
            Status: 'Failed',
            Message: 'A "/saveChatId" végpont nem működik!'
        });
    }
});
router.get('/sendChatId', async (request, response) => {
    try {
        const chatId = request.session.chatId;
        if (!chatId) {
            response.status(200).json({
                Status: 'Failed',
                exists: false
            });
        } else {
            response.status(200).json({
                Status: 'Success',
                exists: true,
                Result: chatId
            });
        }
    } catch (error) {
        console.error(error);
        response.status(500).json({
            Status: 'Failed',
            Message: 'A "/sendChatId" végpont nem működik!'
        });
    }
});

router.post('/removeChatId', async (request, response) => {
    try {
        if (!request.session.chatId) {
            response.status(200).json({
                Status: 'Failed',
                Result: 'Nincs mentett chatId'
            });
        } else {
            request.session.chatId = null;
            response.status(200).json({
                Status: 'Success',
                Result: 'chatId törölve'
            });
        }
    } catch (error) {
        console.error(error);
        response.status(500).json({
            Status: 'Failed',
            Message: 'A "/removeChatId" végpont nem működik!'
        });
    }
});

router.get('/storedChatIdInfos', async (request, response) => {
    try {
        if (!request.session.chatId) {
            response.status(200).json({
                Status: 'Failed',
                Result: 'Nincs mentett chatId'
            });
        } else {
            const chatInfos = await database.chatInfoByChatId(request.session.chatId);
            response.status(200).json({
                Status: 'Success',
                Result: chatInfos.chat_name
            });
        }
    } catch (error) {
        console.error(error);
        response.status(500).json({
            Status: 'Failed',
            Message: 'A "/removeChatId" végpont nem működik!'
        });
    }
});

const chatStorage = multer.diskStorage({
    destination: (request, file, callback) => {
        let fullpath = path.join(__dirname, '../chat_images');
        fs.mkdir(fullpath, { recursive: true });
        callback(null, fullpath);
    },
    filename: (request, file, callback) => {
        callback(null, Date.now() + '-' + file.originalname); //?egyedi név: dátum - file eredeti neve
    }
});

const chatUpload = multer({ storage: chatStorage });

router.post('/createChat', chatUpload.single('img'), async (request, response) => {
    try {
        let userIds = request.body.userIds.split(',');
        console.log(request.body.userIds);
        let imageName = request.file.filename;
        let { chatName } = request.body;

        let result = await database.createChat(userIds, imageName, chatName);

        response.status(200).json({
            Status: result
        });
    } catch (error) {
        console.log(error);
        response.status(500).json({
            Status: 'Failed',
            Message: 'A "/createChat" végpont nem működik!',
            Error: error.message
        });
    }
});

//#endregion

router.get('/searchUser/:username', async (request, response) => {
    try {
        const username = request.params.username;
        const users = await database.searchUser(username);

        response.status(200).json({
            Status: 'Success',
            Data: users
        });
    } catch (error) {
        response.status(500).json({
            Status: 'Failed',
            Message: 'A "/searchUser" végpont nem működik!'
        });
    }
});

router.post('/saveUsername', async (request, response) => {
    try {
        const { username } = request.body;
        request.session.username = username;
        response.status(200).json({
            Status: 'Success'
        });
    } catch (error) {
        console.error(error);
        response.status(500).json({
            Status: 'Failed',
            Message: 'A "/saveUsername" végpont nem működik!'
        });
    }
});

router.get('/sendUsername', async (request, response) => {
    try {
        const username = request.session.username;
        if (!username) {
            response.status(200).json({
                Status: 'Failed',
                exists: false
            });
        } else {
            response.status(200).json({
                Status: 'Success',
                exists: true,
                Result: username
            });
        }
    } catch (error) {
        console.error(error);
        response.status(500).json({
            Status: 'Failed',
            Message: 'A "/sendUsername" végpont nem működik!'
        });
    }
});

router.post('/removeUsername', async (request, response) => {
    try {
        if (!request.session.username) {
            response.status(200).json({
                Status: 'Failed',
                Result: 'Nincs mentett username'
            });
        } else {
            request.session.username = null;
            response.status(200).json({
                Status: 'Success',
                Result: 'username törölve'
            });
        }
    } catch (error) {
        console.error(error);
        response.status(500).json({
            Status: 'Failed',
            Message: 'A "/removeUsername" végpont nem működik!'
        });
    }
});

router.post('/saveUserId', async (request, response) => {
    try {
        const { userId } = request.body;
        request.session.userId = userId;
        response.status(200).json({
            Status: 'Success'
        });
    } catch (error) {
        console.error(error);
        response.status(500).json({
            Status: 'Failed',
            Message: 'A "/saveUserId" végpont nem működik!'
        });
    }
});

router.get('/sendUserId', async (request, response) => {
    try {
        let userId = request.session.userId;
        if (!userId) {
            userId = await database.getUserByUsername(request.session.username);
            /*
            response.status(200).json({
                Status: 'Failed',
                exists: false
            });*/
        }
        if (!!userId) {
            response.status(200).json({
                Status: 'Success',
                exists: true,
                userId: userId
            });
        }
    } catch (error) {
        console.error(error);
        response.status(500).json({
            Status: 'Failed',
            Message: 'A "/sendUserId" végpont nem működik!'
        });
    }
});

router.post('/removeUserId', async (request, response) => {
    try {
        if (!request.session.userId) {
            response.status(200).json({
                Status: 'Failed',
                Result: 'Nincs mentett userId'
            });
        } else {
            request.session.username = null;
            response.status(200).json({
                Status: 'Success',
                Result: 'userId törölve'
            });
        }
    } catch (error) {
        console.error(error);
        response.status(500).json({
            Status: 'Failed',
            Message: 'A "/removeUserId" végpont nem működik!'
        });
    }
});

//! ADMIN
//#region Admin
router.post('/deletePost', async (request, response) => {
    try {
        const { postId } = request.body;
        console.log(postId);
        const affectedRows = await database.deletePost(postId);
        if (affectedRows != 0) {
            response.status(200).json({
                Status: 'Success'
            });
        } else {
            response.status(200).json({
                Status: 'Failed',
                Message: 'Nincs ilyen id-val poszt!'
            });
        }
    } catch (error) {
        throw new Error(`Hiba a "deletePost" végpontban: ${error}`);
    }
});

router.get('/getProfilesAdmin', async (request, response) => {
    try {
        let resultArr = [];
        const sqlResult = await database.adminProfiles();
        for (const obj of sqlResult) {
            resultArr.push({
                userId: obj.user_id,
                username: obj.username,
                email: obj.email,
                registrationDate: convertUnixToReadableDate(Date.parse(obj.registration_date)),
                postCount: obj.post_count,
                commentCount: obj.comment_count,
                isAdmin: obj.is_admin,
                isReported: obj.is_reported
            });
        }
        response.status(200).json({
            Status: 'Success',
            Result: resultArr
        });
    } catch (error) {
        throw new Error(`Hiba a "getProfilesAdmin" végpontban: ${error}`);
    }
});

router.get('/getProfileData/:userId', async (request, response) => {
    try {
        const userId = request.params.userId;
        const profileData = await database.adminProfileData(userId);

        response.status(200).json({
            Status: 'Success',
            ProfileData: profileData
        });
    } catch (error) {
        throw new Error(`Hiba a "getProfileData" végpontban: ${error}`);
    }
});

router.post('/updateProfileData', async (request, response) => {
    try {
        const { userId, profileUsername, profileRegDate, profileEmail, profileBiography } =
            request.body;
        const updateProfile = await database.updateProfile(
            userId,
            profileUsername,
            profileRegDate,
            profileEmail,
            profileBiography
        );
        response.status(200).json({
            Status: updateProfile
        });
    } catch (error) {
        throw new Error(`Hiba a "updateProfileData" végpontban: ${error}`);
    }
});

router.post('/deleteProfile', async (request, response) => {
    try {
        const { userId } = request.body;
        const deleteProfile = await database.deleteProfile(userId);
        response.status(200).json({
            Status: deleteProfile
        });
    } catch (error) {
        throw new Error(`Hiba a "deleteProfile" végpontban: ${error}`);
    }
});

router.post('/clearProfile', async (request, response) => {
    try {
        const { userId } = request.body;
        const clearProfile = await database.clearProfile(userId);
        response.status(200).json({
            Status: clearProfile
        });
    } catch (error) {
        throw new Error(`Hiba a "clearProfile" végpontban: ${error}`);
    }
});

router.post('/clearPost', async (request, response) => {
    try {
        const { postId } = request.body;
        const clearPost = await database.clearPost(postId);
        response.status(200).json({
            Status: clearPost
        });
    } catch (error) {
        throw new Error(`Hiba a "clearPost" végpontban: ${error}`);
    }
});

router.get('/getPostsAdmin', async (request, response) => {
    try {
        let resultArr = [];
        const sqlResult = await database.adminPosts();
        for (const obj of sqlResult) {
            resultArr.push({
                postId: obj.post_id,
                username: obj.username,
                creationDate: convertUnixToReadableDate(Date.parse(obj.creation_date)),
                upvote: obj.upvote,
                downvote: obj.downvote,
                pictureCount: obj.picture_count,
                isReported: obj.is_reported
            });
        }
        response.status(200).json({
            Status: 'Success',
            Result: resultArr
        });
    } catch (error) {
        throw new Error(`Hiba a "getPostsAdmin" végpontban: ${error}`);
    }
});

router.get('/getPostData/:postId', async (request, response) => {
    try {
        const postId = request.params.postId;
        const postData = await database.adminPostData(postId);
        let pics = [];

        for (const data of postData) {
            pics.push(data.picture_link);
        }

        const data = {
            description: postData[0].description,
            tags: postData[0].tags,
            location: postData[0].location,
            latitude: postData[0].latitude,
            longitude: postData[0].longitude,

            postId: postData[0].post_id,
            creationDate: postData[0].creation_date,
            username: postData[0].username,
            userId: postData[0].user_id,
            isReported: postData[0].is_reported,
            pictureLinks: pics
        };

        response.status(200).json({
            Status: 'Success',
            postData: data
        });
    } catch (error) {
        throw new Error(`Hiba a "getProfileData" végpontban: ${error}`);
    }
});

router.post('/updatePostData', async (request, response) => {
    try {
        const {
            postId,
            postDescription,
            postInputCreationDate,
            postLatitude,
            postLocationName,
            postLongitude,
            postTags
        } = request.body;
        console.log(request.body);
        const updatePost = await database.updatePost(
            postId,
            postDescription,
            postInputCreationDate,
            postLatitude,
            postLocationName,
            postLongitude,
            postTags
        );
        response.status(200).json({
            Status: updatePost
        });
    } catch (error) {
        throw new Error(`Hiba a "updateProfileData" végpontban: ${error}`);
    }
});

router.get('/getCommentsAdmin', async (request, response) => {
    try {
        let resultArr = [];
        const sqlResult = await database.adminComments();
        for (const obj of sqlResult) {
            resultArr.push({
                commentId: obj.comment_id,
                postId: obj.post_id,
                username: obj.username,
                commentContent: obj.comment_content,
                commentDate: convertUnixToReadableDate(Date.parse(obj.comment_date)),
                isReported: obj.is_reported
            });
        }
        response.status(200).json({
            Status: 'Success',
            Result: resultArr
        });
    } catch (error) {
        throw new Error(`Hiba a "getCommentsAdmin" végpontban: ${error}`);
    }
});

router.get('/getCommentData/:commentId', async (request, response) => {
    try {
        const commentId = request.params.commentId;
        const commentData = await database.adminCommentData(commentId);
        response.status(200).json({
            Status: 'Success',
            commentData: commentData[0]
        });
    } catch (error) {
        throw new Error(`Hiba a "getCommentData" végpontban: ${error}`);
    }
});

router.post('/updateCommentData', async (request, response) => {
    try {
        const { commentId, commentDate, commentContent } = request.body;
        console.log(request.body);
        const updateComment = await database.updateComment(commentId, commentDate, commentContent);
        response.status(200).json({
            Status: updateComment
        });
    } catch (error) {
        throw new Error(`Hiba a "updateProfileData" végpontban: ${error}`);
    }
});

router.post('/deleteComment', async (request, response) => {
    try {
        const { commentId } = request.body;
        const deleteComment = await database.deleteComment(commentId);
        response.status(200).json({
            Status: deleteComment
        });
    } catch (error) {
        throw new Error(`Hiba a "deleteComment" végpontban: ${error}`);
    }
});

router.post('/clearComment', async (request, response) => {
    try {
        const { commentId } = request.body;
        console.log(commentId);
        const clearComment = await database.clearComment(commentId);
        response.status(200).json({
            Status: clearComment
        });
    } catch (error) {
        throw new Error(`Hiba a "clearComment" végpontban: ${error}`);
    }
});

//#endregion

//! MAP

router.get('/markers', async (request, response) => {
    try {
        const markers = await database.markers();
        response.status(200).json({
            Status: 'success',
            Markers: markers
        });
    } catch (error) {
        response.status(500).json({
            Status: 'Failed',
            Message: 'A "/markers" végpont nem működik!'
        });
    }
});
const profileStorage = multer.diskStorage({
    destination: (request, file, callback) => {
        callback(null, path.join(__dirname, '../profile_images'));
    },
    filename: (request, file, callback) => {
        callback(null, Date.now() + '-' + file.originalname); //?egyedi név: dátum - file eredeti neve
    }
});

const profileUpload = multer({ storage: profileStorage });

router.post(
    '/modifyProfilePicture',
    profileUpload.single('profilePic'),
    async (request, response) => {
        const filename = request.file.filename;
        const status = await database.updateProfilePicture(request.session.username, filename);

        response.status(200).json({
            Status: status,
            Link: filename
        });
    }
);

router.post('/modifyProfileName', async (request, response) => {
    const { username } = request.body;
    const status = await database.updateProfileName(request.session.username, username);

    response.status(200).json({
        Status: status,
        Name: username
    });
});

router.post('/modifyProfileBiography', async (request, response) => {
    const { biography } = request.body;
    const username = request.session.username;
    const status = await database.updateProfileBiography(username, biography);

    response.status(200).json({
        Status: status,
        Biography: biography
    });
});

//! FÜGGVÉNYEK
//? Hash-eljük a megadott stringet, és visszaadunk egy salt, és egy hash változót.
function HashString(string) {
    //? salt: egy 16 karakteres random string amit átkonvertálunl hex-é
    const salt = crypto.randomBytes(16).toString('hex');

    //? hash: a string, és salt alapján generált 64 karakteres string amit átkonvertálunk hex-é
    const hash = crypto.scryptSync(string, salt, 64).toString('hex');
    return { salt, hash };
}

function VerifyHashedString(string, salt, hash) {
    if (string !== null && salt !== null) {
        const hashedString = crypto.scryptSync(string, salt, 64).toString('hex');
        return hashedString === hash;
    } else {
        return null;
    }
}

function convertUnixToReadableDate(unix) {
    let date = new Date(unix);
    let year = date.getUTCFullYear(date);
    //! VALAMIÉRT EZ A CSODA 0-TÓL KEZDI A HÓNAPOKAT
    let month = date.getUTCMonth(date) + 1;
    month = month.toString();
    if (month.length == 1) {
        month = '0' + month.toString();
    }
    let day = date.getUTCDate(date);
    let hour = date.getUTCHours(date);
    let minute = date.getUTCMinutes(date);
    let second = date.getUTCSeconds(date);
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

function formatDate(date) {
    const year = date.getUTCFullYear();
    const month = date.getUTCSeconds;
}

function clearFolder(path) {
    fs.readdir(path).then((files) => {
        files.forEach((file) => {
            //console.log(file);
            fs.unlink(path + '/' + file);
        });
    });
}

function uploadFiles(multerUpload, fileInput) {
    multerUpload.array(fileInput);
}

async function isAdmin(request, response, next) {
    try {
        const username = request.session.username;
        if (username != undefined) {
            const isAdmin = await database.isAdmin(username);
            if (isAdmin) {
                next();
            } else {
                response.status(200).send({
                    Status: 'Failed',
                    Message: 'Önnek nincs meg a megfelelő jogosultsága!'
                });
            }
        } else {
            response.status(200).send({
                Status: 'Failed',
                Message: 'Nincsen elmentett felhasználónév!'
            });
        }
    } catch (error) {
        throw new Error(`Hiba az "isAdmin" middleware-ben: ${error}`);
    }
}

module.exports = router;
