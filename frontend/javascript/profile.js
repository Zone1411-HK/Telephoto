document.addEventListener("DOMContentLoaded", () => {
    getProfile();
})

const getFetch = async (url) => {
    try{
        const response = await fetch(url);        
        if(!response.ok){
            throw new Error("Fail XD" + response.status, response.statusText);
        }
        return await response.json();
    } catch (error) {
        throw new Error("Fail XD" + error);
    }
}

const getProfile = async () => {
    try{
        const response = await getFetch('/api/profileInfos');
        const data = response.results;
        console.log(response);
        const loggedIn = 1-1;
        const userName = data[loggedIn].username;
        const userPic = data[loggedIn].profile_picture_link;
        const userBio = data[loggedIn].biography;
        const userDate = data[loggedIn].registration_date;
        
        console.log(userName);
        console.log(userPic);
        console.log(userBio);
        console.log(userDate);
    } catch (error) {
        console.error("Hiba" + error);
    }
}
