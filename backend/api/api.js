const express = require('express');
const router = express.Router();
const database = require('../sql/database.js');
const fs = require('fs/promises');
const JWT = require('jsonwebtoken');
const crypto = require('node:crypto');
const env = require('dotenv');
env.config();
//! FONTOS: AZ .env-t NEM TÖLTJÜK FEL GITHUB-RA. ERGÓ MINDENKINEK A SAJÁT SZMITÓJÁN LÉTRE KELL HOZNIA. Nem tudom, hogy ugyan annak kell-e lennie, valószínű igen.
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
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

//TODO MINDEN ÉRZÉKENY HELYRE BESZÚRNI
//! Középső árú aka MIDDLEWARE
function verifyToken(request, response, next) {
    //? Lekérjük az "authorization" header-t.
    const header = request.headers['authorization'];

    //? Ha a header nem üres akkor spliteljük és megkapjuk az elküldött "accessToken"-t.
    //? Például: header = Bearer abc123 => token = abc123
    const token = header && header.split(' ')[1];

    //? Ha a token üres akkor visszadobunk egy hibát, miszerint nincs token.
    if (!token) {
        return response.status(401).json({
            error: 'No token'
        });
    }

    try {
        //? Beépített függvény segítségével megpróbáljuk dekódolni a token-t egy .env-ben tárolt secret alapján
        const decoded = JWT.verify(token, accessTokenSecret);

        request.user = decoded;

        //? Miután sikeres lefutott a kód, azután tovább mehetünk a végepontra.
        //? Sorrend: Middleware => Endpoint
        next();
    } catch (error) {
        return response.status(403).json({
            error: 'invalid token'
        });
    }
}

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
        let userId = '';
        let j = 0;
        while (j < loginSelect.length && userId == '') {
            if (
                loginSelect[j].username == username &&
                VerifyHashedString(
                    password,
                    loginSelect[j].password_salt,
                    loginSelect[j].password_hash
                )
            ) {
                userId = loginSelect[j].user_id;
            }
            j++;
        }

        if (userId != '') {
            const user = { userId, username };

            //? Egy olyan "token" amelyet minden fontosabb utasításkor ellenőrzünk, hogy valid-e. Ez alap esetben 30 percig él ami azt jelenti, hogy például bejelentkezés utána ha ez a 30 perc letelik és ráfrissítünk az oldalra akkor kidob a bejelentkezés felületre. Az "accessToken" jelen esetben a felhasználó azonosítóját és felhasználónevét tárolja. Az "accessToken"-t localStorage-ben tároljuk.
            const accessToken = JWT.sign(user, accessTokenSecret, { expiresIn: '30m' });

            //? Ennek a "token"-nek akkor van szerepe amikor az "accessToken" lejárt. Vele tudjuk újra frissíteni az "accessToken"-t, ha az lejárt és a "refreshToken" megegyezik a felhasználó böngészőjében és az adatbázisban. Ilyenkor le tudjuk frissíteni az "accessToken"-t. Ezt minden bejelentkezéskor generáljuk, 1 napig él, és az adatbázisban, illetve cookie-ban tároljuk. Ez is tárolja a felhasználó azonosítóját és nevét.
            const refreshToken = JWT.sign(user, refreshTokenSecret, { expiresIn: '1d' });

            //? Létrehozzuk az adatbázisban a "refreshToken"-t
            const result = await database.addRefreshToken(userId, refreshToken);

            //? Létrehozzuk a böngészőben a cookie-t
            response.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60 * 24
            });

            //? Amennyiben minden rendben van visszaküldjük az "accessToken"-t
            response.status(200).json({
                status: 'Successful login',
                isLoggedIn: true,
                accessToken: accessToken
            });
        } else {
            response.status(401).json({
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
        console.log(fileNames);
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
        callback(null, file.originalname); //?egyedi név: post - file eredeti neve
    }
});

const tempUpload = multer({ storage: tempStorage });
const postUpload = multer({ storage: postStorage });

router.post('/tempUpload', async (request, response) => {
    try {
        uploadFiles(tempUpload, 'uploadFile');
        response.status(201).json({
            Message: 'Sikeres feltöltés!'
        });
    } catch (error) {
        response.status(500).json({
            error: `Endpoint ERROR: tempUpload: ${error}`
        });
    }
});

router.post('/uploadPost', async (request, response) => {
    try {
        uploadFiles(postUpload, 'uploadFile');
        response.status(201).json({
            Message: 'Sikeres feltöltés!'
        });
    } catch (error) {
        response.status(500).json({
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
        console.log(data);
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
    console.log(data);
});

//! TOKENEZÉS

//? Frissítjuk a meglévő "accessToken"-t
router.post('/updateAccessToken', async (request, response) => {
    try {
        //? Lekérjük a "refreshToken"-t a böngészőből. Ha üres visszaadunk egy hibát.
        const refreshToken = request.cookies.refreshToken;
        if (!refreshToken) {
            return response.status(401).json({
                error: 'Nincs refresh token'
            });
        }

        //? Lekérjük a "refreshToken"-t az adatbázisból a böngészőből megszerzett "refreshToken" alapján. Ha nem találjuk meg akkor visszaadunk egy hibát.
        const dbToken = await database.userRefreshToken(refreshToken);
        if (!dbToken) {
            console.log('asd');
            return response.status(403).json({
                error: 'Helytelen refresh token'
            });
        }

        //? Beépített függvény segítségével dekódoljuk a "refreshToken"-t.
        const user = JWT.verify(refreshToken, refreshTokenSecret);

        //? Generálunk egy új "accessToken"-t.
        const newAccessToken = JWT.sign(
            {
                userId: user.userId,
                username: user.username
            },
            accessTokenSecret,
            { expiresIn: '30m' }
        );
        response.status(200).json({
            newAccessToken: newAccessToken
        });
    } catch (error) {
        response.status(500).json({
            error: 'Endpoint ERROR: newAccessToken: ' + error
        });
    }
});

//? Megnézzük, hogy helyes-e az "accessToken".
router.get('/testAccessToken', verifyToken, async (request, response) => {
    response.status(200).json({
        isValid: true
    });
});

//? Dekódoljuk az "accessToken"-t amennyiben az helyes.
router.get('/decodeAccessToken', verifyToken, async (request, response) => {
    response.status(200).json({
        userId: request.user.userId,
        username: request.user.username
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
module.exports = router;
