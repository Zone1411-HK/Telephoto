document.addEventListener("DOMContentLoaded", () => {

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
        const response = await getFetch("/profileInfos");
        console.log(response);
    } catch (error) {
        console.error("Hiba" + error);
    }
}
