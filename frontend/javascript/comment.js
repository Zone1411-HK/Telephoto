document.addEventListener("DOMContentLoaded", () => {
    getComments();
})

const getComments = async() => {    
    try{
        const response = await getFetch('/api/commentInfos');
        const data = response.results;
        console.log(data);
        for(let i = 0; i < data.length; i++){
            const userName = data[i].username;
            const userPic = data[i].profile_picture_link;
            const text = data[i].comment_content;
            console.log(userName);
            console.log(userPic);
            console.log(text);
        }
    } catch (error) {
        console.error("Hiba" + error);
    }
}