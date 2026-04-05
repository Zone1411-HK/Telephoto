//!Module-ok importálása
const express = require('express'); //?npm install express
const session = require('express-session'); //?npm install express-session
const path = require('path');
//!Beállítások
const app = express();
const router = express.Router();

app.use(express.json()); //?Middleware JSON
app.set('trust proxy', 1); //?Middleware Proxy

//!Session beállítása:
app.use(
    session({
        secret: 'titkos_kulcs', //?Ezt generálni kell a későbbiekben
        resave: false,
        saveUninitialized: true
    })
);

//!Routing
//?Oldalak:
router.get('/', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/index.html'));
});
router.get('/admin', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/admin.html'));
});
router.get('/map', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/map.html'));
});
router.get('/profile', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/profil.html'));
});
router.get('/login', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/login.html'));
});

const endpoints = require('./api/api.js');
app.use('/api', endpoints);
app.use('/', router);

//!Szerver futtatása
app.use(express.static(path.join(__dirname, '../frontend'))); //?frontend mappa tartalmának betöltése az oldal működéséhez

app.use('/node', express.static(path.join(__dirname, '../backend/node_modules'))); //! Ezért nem tudom Kardos megöl-e

app.use('/uploads', express.static(path.join(__dirname, '../backend/uploads'))); //! Ezért nem tudom Kardos megöl-e 2

app.use('/user_pics', express.static(path.join(__dirname, '../backend/user_pics'))); //! Ezért nem tudom Kardos megöl-e 3

app.use('/chat_images', express.static(path.join(__dirname, '../backend/chat_images')));
app.use('/profile_images', express.static(path.join(__dirname, '../backend/profile_images')));

module.exports = app;
