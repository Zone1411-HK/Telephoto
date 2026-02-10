document.addEventListener("DOMContentLoaded", () => {
    getTopPosts();
})

function base(data, i){  
        console.log("mukudik");  

        let object = {
            username: data[i].username,          
            userPic : data[i].profile_picture_link,
            pic : data[i].picture_link,
            post_id : data[i].post_id,
            description : data[i].description,
            tags : data[i].tags,
            location : data[i].location,
            latitude : data[i].latitude,
            longitude : data[i].longitude,
            creation_date : data[i].creation_date
        };   
        
    return object;
};

const getTopPosts = async () => {   
    try{
        const response = await getFetch('/api/topPosts');
        const data = response.results;
        console.log(data);        

        for(let i = 0; i < data.length; i++){
            console.log("ciklus");            
            const test = base(data, i);
            console.log(test);
            
            console.log("név" + test.username);
            console.log("userpic" + test.userpic);
            console.log("pic" + test.pic);
            console.log("desc" + test.description);
            console.log("tag" + test.tags);
            console.log("loc" + test.location);
            console.log("lat" + test.latitude);
            console.log("lon" + test.longitude);
            console.log("create" + test.creation_date);
            console.log("postid" + test.post_id);

            const response2 = await PostMethodFetch('/api/commentInfos', {post_id: test.post_id});
            const data2 = response2.results;
            console.log(data2);
            for(let i = 0; i < data.length; i++){
                const userName = data[i].username;
                const userPic = data[i].profile_picture_link;
                const text = data[i].comment_content;
                console.log("username" + userName);
                console.log("userpic" + userPic);
                console.log("text" + text);
            }


            hangPictures(test);
        }
        
    } catch (error) {
        console.error("Hiba" + error);
    }
};

const hangPictures = (test) => {
    let posts = document.getElementById("posts");
    let post = document.createElement("div");
    post.classList.add("post");

    let ropediv = document.createElement("div");
    let rope = document.createElement("hr");
    let ropetexture = document.createElement("hr");
    ropediv.classList.add("ropeDiv");
    rope.classList.add("rope");
    ropetexture.classList.add("ropeTexture");

    let clip = document.createElement("div");
    let imgclip = document.createElement("div");
    let imgcliptexture = document.createElement("div");
    clip.classList.add("clip");
    imgclip.classList.add("imgClip");
    imgcliptexture.classList.add("imgClipTexture");

    let postcontent = document.createElement("div");
    let imgdiv = document.createElement("div");
    let img = document.createElement("img");
    postcontent.classList.add("postContent");
    imgdiv.classList.add("imgDiv");

    let p = document.createElement("p");

    p.innerHTML = test.description;
    img.src = "../../backend/uploads/" + test.userpic;

    imgdiv.appendChild(img);
    postcontent.appendChild(imgdiv);
    postcontent.appendChild(p);

    clip.appendChild(imgclip);
    clip.appendChild(imgcliptexture);

    ropediv.appendChild(rope);
    ropediv.appendChild(ropetexture);

    post.appendChild(ropediv);
    post.appendChild(clip);
    post.appendChild(postcontent);  
    
    posts.appendChild(post);
}