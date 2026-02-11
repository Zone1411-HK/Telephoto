document.addEventListener('DOMContentLoaded', () => {
    //getProfile();
});

const getFetch = async (url) => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Fail XD' + response.status, response.statusText);
        }
        return await response.json();
    } catch (error) {
        throw new Error('Fail XD' + error);
    }
};

const getProfile = async () => {
    try {
        const response = await getFetch('/api/profileInfos');
        const data = response.results;
        console.log(response);

        const userName = data[0].username;
        const userPic = data[0].profile_picture_link;
        const userBio = data[0].biography;
        const userDate = data[0].registration_date;

        console.log('név' + userName);
        console.log('userpic' + userPic);
        console.log('bio' + userBio);
        console.log('date' + userDate);
    } catch (error) {
        console.error('Hiba' + error);
    }
};
