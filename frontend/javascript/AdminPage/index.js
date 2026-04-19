import * as adminFunctions from './admin.js';
import { socket } from '../socket.js';

let matchMedia = window.matchMedia('(width > 768px)');
let userTrackerArray = [];
let userTrackerTimeArray = [];

socket.emit('requestActiveUsers');
setInterval(() => {
    socket.emit('requestActiveUsers');
}, 300);

socket.on('responseActiveUsers', (activeUsers) => {
    if (userTrackerArray.length >= 5) {
        userTrackerArray.shift();
        userTrackerTimeArray.shift();
    }
    userTrackerTimeArray.push(adminFunctions.convertToTime(Date.now()));
    userTrackerArray.push(activeUsers);

    adminFunctions.generateBarChart(userTrackerArray, userTrackerTimeArray);
});

document.addEventListener('DOMContentLoaded', () => {
    adminFunctions.startUp();
});

window.addEventListener('resize', () => {
    let sidebar = document.getElementById('sidebar');

    if (!matchMedia.matches) {
        sidebar.dataset.collapsed = 'false';
        sidebar.classList.remove('collapsed');
        for (let i = 1; i < sidebar.children.length; i++) {
            sidebar.children[i].style.visibility = 'visible';
        }
    }
});
