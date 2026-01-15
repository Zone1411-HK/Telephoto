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

const upload = multer({ storage });

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
        const loginSelect = await database.loginSelect();
        console.log(loginSelect.length);
        /*const selectall = await database.selectall();
        response.status(200).json({
            message: 'Ez a végpont működik.',
            results: selectall
        });*/
    } catch (error) {
        response.status(500).json({
            message: 'Ez a végpont nem működik.'
        });
    }
});

//? REGISZTRÁCIÓ

//? Hash-eljük a megadott jelszót, és visszaadunk egy salt, és egy hash változót.
function HashPassword(password) {
    //? salt: egy 16 karakteres random hex string
    const salt = crypto.randomBytes(16).toString('hex');

    //? hash: a jelszó, és salt alapján generált 64 karakteres hex string
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return { salt, hash };
}

function VerifyPassword(password, salt, hash) {
    const hashedPassword = crypto.scryptSync(password, salt, 64).toString('hex');
    return hashedPassword;
}

router.post('/registration', async (request, response) => {
    const { username, email, password } = request.body;
    const { salt, hash } = HashPassword(password);
    const addNewUser = await database.addNewUser(username, salt, hash, email);
    response.status(200).json({
        status: 'Successful registration',
        results: addNewUser[0],
        fields: addNewUser[1]
    });
});

//? LOGIN

router.post('/login', async (request, response) => {
    const loginSelect = await database.loginSelect();
    const { username, password } = request.body;
    let isVerified = false;
    let j = 0;
    while (j < loginSelect.length && !isVerified) {
        if (
            loginSelect[j].username == username &&
            VerifyPassword(password, loginSelect[j].password_salt, loginSelect[j].password_hash)
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
});

//TODO SQL LEKÉRDEZÉSSEL MEGKAPNI AZ EDDIG REGISZTRÁLT NEVEKET
router.get('/isUsernameAvailable/:name', async (request, response) => {
    const name = request.params.name;
    let j = 0;
    while (j < users.length && users[j].username != name) {
        j++;
    }
    if (j == users.length) {
        response.status(200).json({
            available: true
        });
    } else {
        response.status(200).json({
            available: false
        });
    }
});

module.exports = router;
