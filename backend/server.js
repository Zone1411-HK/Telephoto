const app = require('./app');

const ip = '127.0.0.1';
const port = 3000;

//!API endpoints
const http = require('http').Server(app);
const io = require('socket.io')(http);

let activeUsers = 0;

io.on('connection', (socket) => {
    activeUsers++;
    console.log('Active users: ', activeUsers);

    socket.on('requestActiveUsers', () => {
        io.emit('responseActiveUsers', activeUsers);
    });

    socket.on('newMessage', (chatId) => {
        io.to('chat-' + chatId).emit('newMessage');
    });

    socket.on('joinRoom', (id) => {
        socket.join('chat-' + id);
    });

    socket.on('disconnect', () => {
        activeUsers--;
        console.log('user disconnected');
        console.log('Active users: ', activeUsers);
    });
});

http.listen(port, ip, () => {
    console.log(`Szerver elérhetősége: http://${ip}:${port}`);
});
/*
app.listen(port, ip, () => {
    console.log(`Szerver elérhetősége: http://${ip}:${port}`);
});
*/

//?Szerver futtatása terminalból: npm run dev
//?Szerver leállítása (MacBook és Windows): Control + C
//?Terminal ablak tartalmának törlése (MacBook): Command + K
