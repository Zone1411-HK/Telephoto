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

//! LOGIN
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

let storedUsernameHash;
router.get('/hashUser/:username', async (request, response) => {
    const username = request.params.username;
    const { hash } = HashString(username);
    storedUsernameHash = hash;
    response.status(200).json({
        username: hash
    });
});

//! POSZT FELTÖLTÉS
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
            Message: 'Sikeres feltöltés!'
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
            Status: 'Success'
        });
    } catch (error) {
        response.status(500).json({
            Status: 'Failed',
            error: `Endpoint ERROR: uploadPost: ${error}`
        });
    }
});

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

//! PROFIL ADATOK (nincs kész)
router.get('/profileInfos', async (request, response) => {
    try {
        //const data = await database.loadProfile();
        const data = '';

        response.status(200).json({
            status: 'Success',
            results: data
        });
        //console.log(data);
    } catch (error) {
        //console.log(error);
    }
});

//! KOMMENT ADATOK
router.get('/commentInfos', async (request, response) => {
    //const data = await database.loadComments();
    const data = '';
    response.status(200).json({
        status: 'Success',
        results: data
    });
    //console.log(data);
});

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
            console.log();
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
            console.log(file);
            fs.unlink(path + '/' + file);
        });
    });
}
function uploadFiles(multerUpload, fileInput) {
    multerUpload.array(fileInput);
}

router.get('/checkHashUserIntegrity/:storedData', async (request, response) => {
    const storedData = request.params.storedData;
    response.status(200).json({
        isValid: storedData === storedUsernameHash ? true : false
    });
});
module.exports = router;
