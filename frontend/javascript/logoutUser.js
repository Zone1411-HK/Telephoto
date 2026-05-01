import { socket } from './socket.js';
import { GetMethodFetch } from './fetch.js';
import { logout } from './util.js';

async function GetUserId() {
    try {
        const response = await GetMethodFetch('/api/sendUserId');
        if (response.Status == 'Success') {
            return response.userId;
        }
        return -1;
    } catch (error) {
        console.error(error);
        return -1;
    }
}

socket.on('logoutUser', async (userId) => {
    let currentUserId = await GetUserId();

    console.log(currentUserId + ' ' + userId);

    if (currentUserId == userId) {
        logout();
    }
});
