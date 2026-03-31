class ChatData {
    constructor(id, name, pictureLink, lastMessage, userOfLastMessage) {
        this.id = id;
        this.name = name;
        this.pictureLink = pictureLink;
        this.lastMessage = lastMessage;
        this.userOfLastMessage = userOfLastMessage;
    }
}

function chatAddEventListeners() {
    document.getElementById('newChat').addEventListener('click', openNewChatWindow);
    document.getElementById('newChatCancel').addEventListener('click', closeNewChatWindow);
    document.getElementById('newChatCreate').addEventListener('click', createNewChat);
    document.getElementById('newChatUserInput').addEventListener('input', searchUser);
    document.getElementById('newChatImgInput').addEventListener('change', loadNewChatImg);
}

function loadNewChatImg() {
    let temp = new FileReader();
    temp.onload = function (e) {
        document.getElementById('newChatImg').src = e.target.result;
    };
    temp.readAsDataURL(this.files[0]);
}

async function getChats() {
    const doesChatIdExist = await GetMethodFetch('/api/sendChatId');
    let chatArray = await getChatData();
    if (Array.isArray(chatArray)) {
        const existingChats = document.getElementById('existingChats');
        existingChats.replaceChildren();
        for (const chat of chatArray) {
            console.log(chat);
            const chatDiv = document.createElement('div');
            chatDiv.classList.add('chat');

            const chatImgDiv = document.createElement('div');
            chatImgDiv.classList.add('chatImgDiv');

            const chatImgBorder = document.createElement('div');
            chatImgBorder.classList.add('chatImgBorder');

            const chatImg = document.createElement('img');
            chatImg.classList.add('chatImg');
            chatImg.src = '/chat_images/' + chat.pictureLink;
            chatImgBorder.appendChild(chatImg);

            chatImgDiv.appendChild(chatImgBorder);

            chatDiv.appendChild(chatImgDiv);

            const chatTexts = document.createElement('div');
            chatTexts.classList.add('chatTexts');

            const chatName = document.createElement('h3');
            chatName.innerText = chat.name;
            chatName.classList.add('chatName');
            chatTexts.appendChild(chatName);

            const lastMessage = document.createElement('p');
            lastMessage.classList.add('lastText');
            if (chat.lastMessage != '') {
                lastMessage.innerText = chat.userOfLastMessage + ': ' + chat.lastMessage;
            } else {
                lastMessage.innerText = 'Nincs még üzenet ebben a beszélgetésben!';
            }
            chatTexts.appendChild(lastMessage);

            chatDiv.appendChild(chatTexts);
            chatDiv.dataset.id = chat.id;
            chatDiv.dataset.name = chat.name;
            chatDiv.addEventListener('click', openChat);
            existingChats.appendChild(chatDiv);

            socket.emit('joinRoom', chat.id);
        }
    } else {
        console.error(chatArray);
    }

    if (doesChatIdExist.exists == true) {
        openChat();
    }
}

async function getChatData() {
    try {
        let chatArray = [];
        let username = await GetMethodFetch('/api/sendUsername');
        username = username.Result;
        const chatsResponse = await GetMethodFetch('/api/chatsOfUser/' + username);
        const result = chatsResponse.Result;
        for (const obj of result) {
            const lastMessageResponse = await GetMethodFetch(
                '/api/lastMessageOfChat/' + obj.chat_id
            );
            if (lastMessageResponse.Status == 'Success') {
                const chat = new ChatData(
                    obj.chat_id,
                    obj.chat_name,
                    obj.chat_picture_link,
                    lastMessageResponse.Result == undefined
                        ? ''
                        : lastMessageResponse.Result.message,
                    lastMessageResponse.Result == undefined
                        ? ''
                        : lastMessageResponse.Result.username
                );
                chatArray.push(chat);
            }
        }

        return chatArray;
    } catch (error) {
        return error.message;
    }
}

async function closeChat() {
    const response = await PostMethodFetch('/api/removeChatId');

    const chatWrapper = document.getElementById('openedChatWrapper');
    chatWrapper.classList.add('invisible');

    const chatContainer = document.getElementById('chatContainer');
    chatContainer.classList.remove('invisible');

    await getChats();
}

async function generateChat(element) {
    const doesChatIdExist = await GetMethodFetch('/api/sendChatId');
    let chatId;
    const chatName = document.createElement('h3');

    if (doesChatIdExist.exists == false) {
        chatId = element.dataset.id;
        const chatIdResponse = await PostMethodFetch('/api/saveChatId', {
            chatId: chatId
        });
        chatName.innerText = element.dataset.name;
    } else {
        chatId = doesChatIdExist.Result;
        const infos = await GetMethodFetch('/api/storedChatIdInfos');
        chatName.innerText = infos.Result;
    }

    const chatContainer = document.getElementById('chatContainer');
    chatContainer.classList.add('invisible');

    const chatWrapper = document.getElementById('openedChatWrapper');
    chatWrapper.classList.remove('invisible');

    const openedChat = document.getElementById('openedChat');
    openedChat.dataset.chatId = chatId;
    openedChat.replaceChildren();

    const nav = document.createElement('div');
    nav.classList.add('openedChatNav');

    const chatNameDiv = document.createElement('div');
    chatNameDiv.classList.add('openedChatName');

    chatNameDiv.appendChild(chatName);

    const chatNameCloseDiv = document.createElement('div');
    chatNameCloseDiv.classList.add('openedChatClose');

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.addEventListener('click', closeChat);
    closeButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg"viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;

    chatNameCloseDiv.appendChild(closeButton);

    nav.appendChild(chatNameDiv);
    nav.appendChild(chatNameCloseDiv);

    openedChat.appendChild(nav);
    const messagesDiv = document.createElement('div');
    messagesDiv.classList.add('messagesDiv');
    const response = await GetMethodFetch('/api/messagesOfChat');

    const currentUsername = await GetMethodFetch('/api/sendUsername');

    if (response.Result.length > 0) {
        for (const obj of response.Result) {
            const messageRow = await generateMessage(
                obj.username,
                currentUsername.Result,
                obj.message,
                obj.message_date
            );
            messagesDiv.appendChild(messageRow);
        }
    }

    openedChat.appendChild(messagesDiv);

    const messageInput = generateMessageInput();
    openedChat.appendChild(messageInput);
}

async function openChat() {
    await generateChat(this);
    const openedChat = document.getElementById('openedChat');
    openedChat.style.animation = 'openChat 500ms linear 1 forwards';
    setTimeout(() => {
        openedChat.style.animation = '';
        document.getElementsByClassName('messagesDiv')[0].scrollTop =
            document.getElementsByClassName('messagesDiv')[0].scrollHeight;
    }, 500);
}

async function refreshChat() {
    await generateChat(this);

    document.getElementsByClassName('messagesDiv')[0].scrollTop =
        document.getElementsByClassName('messagesDiv')[0].scrollHeight;
}

function userPopup(event) {
    const popup = document.getElementsByClassName('usernamePopup');
    console.log(popup);
    let username = this.dataset.username;
    let parent = this.parentNode;
    if (popup.length == 0) {
        setTimeout(function () {
            let x = event.clientX;
            let y = event.clientY;
            const popup = document.createElement('p');
            popup.classList.add('usernamePopup');
            popup.style.left = x + 'px';
            popup.style.top = y + 'px';
            popup.innerText = username;
            parent.appendChild(popup);
        }, 400);
    }
}

function removeUserpopup() {
    const popup = document.getElementsByClassName('usernamePopup');
    if (popup.length != 0) {
        for (const p of popup) {
            p.remove();
        }
    }
}

async function generateMessage(username, currentUsername, message, date) {
    const messageRow = document.createElement('div');
    messageRow.classList.add('messageRow');

    const messageContent = document.createElement('p');
    messageContent.classList.add('message');
    messageContent.innerText = message;
    messageContent.dataset.username = username;

    //! Eléggé bugosak. Nem tudom mi legyen vele
    //messageContent.addEventListener('mouseenter', userPopup);
    //messageContent.addEventListener('mouseleave', removeUserpopup);

    const messageDate = document.createElement('p');
    messageDate.classList.add('messageDate');
    messageDate.innerText = date;

    const messageWrapper = document.createElement('div');
    messageWrapper.classList.add('messageWrapper');

    if (username == currentUsername) {
        messageDate.classList.add('FromCurrentUserSide');
        messageContent.classList.add('FromCurrentUserColor', 'FromCurrentUserSide');
    } else {
        messageDate.classList.add('FromOtherUserSide');

        messageContent.classList.add('FromOtherUserColor', 'FromOtherUserSide');
    }
    messageWrapper.appendChild(messageContent);
    messageWrapper.appendChild(messageDate);
    messageRow.appendChild(messageWrapper);
    return messageRow;
}

function generateMessageInput() {
    const div = document.createElement('div');
    div.classList.add('newMessageWrapper');
    const textArea = document.createElement('textarea');
    textArea.id = 'newMessageInput';
    textArea.rows = 1;
    textArea.maxLength = 200;
    textArea.addEventListener('input', expandUpwards);

    const send = document.createElement('button');
    send.type = 'button';
    send.addEventListener('click', sendMessage);
    send.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round" class="feather feather-send"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>`;

    div.appendChild(textArea);
    div.appendChild(send);
    return div;
}

function expandUpwards() {
    const inp = document.getElementById('newMessageInput');
    inp.style.height = 'auto';
    inp.style.height = Math.min(inp.scrollHeight, 200) + 'px';
}

async function sendMessage() {
    const newMessageInput = document.getElementById('newMessageInput');
    if (newMessageInput.value != '') {
        const newMessage = newMessageInput.value;
        const chatId = document.getElementById('openedChat').dataset.chatId;
        let username = await GetMethodFetch('/api/sendUsername');
        username = username.Result;
        socket.emit('newMessage', chatId);
        const response = await PostMethodFetch('/api/sendMessage', {
            message: newMessage,
            chatId: chatId,
            username: username
        });

        if ((response.Status = 'Failed')) {
            //TODO Hiba kezelés
        } else {
        }
    }
}

function openNewChatWindow() {
    document.getElementById('newChatModal').style.display = 'flex';
}

function closeNewChatWindow() {
    document.getElementById('newChatModal').style.display = 'none';
    document.getElementById('newChatUserSuggestionList').replaceChildren();
    document.getElementById('newChatAddedUsers').replaceChildren();
}

async function searchUser() {
    const suggestionDiv = document.getElementById('newChatUserSuggestionList');
    const addedUser = document.getElementById('newChatAddedUsers');
    let { Result } = await GetMethodFetch('/api/sendUsername');

    if (this.value.length >= 3) {
        const { Status, Data } = await GetMethodFetch('/api/searchUser/' + this.value);
        if (Status == 'Success') {
            suggestionDiv.replaceChildren();
            for (const val of Data) {
                if (val.username != Result) {
                    const user = document.createElement('div');
                    user.classList.add('suggestedUser');
                    user.dataset.userId = val.user_id;
                    user.dataset.username = val.username;
                    user.dataset.userPic = val.profile_picture_link;

                    const img = document.createElement('img');
                    if (val.profile_picture_link == null) {
                        img.src = '/user_pics/default.svg';
                    } else {
                        img.src = '/user_pics/' + val.profile_picture_link;
                    }
                    img.classList.add('suggestedImg');

                    const name = document.createElement('div');
                    name.innerText = val.username;

                    user.appendChild(img);
                    user.appendChild(name);
                    user.addEventListener('click', addUser);

                    for (const child of addedUser.children) {
                        if (child.dataset.userId == user.dataset.userId) {
                            user.classList.add('selected');
                        }
                    }

                    suggestionDiv.appendChild(user);
                }
            }
        }
    } else {
        suggestionDiv.replaceChildren();
    }
}

function addUser() {
    const addedUsers = document.getElementById('newChatAddedUsers');

    let isAdded = false;
    for (const child of addedUsers.children) {
        if (child.dataset.userId == this.dataset.userId) {
            isAdded = true;
            this.classList.remove('selected');
            addedUsers.removeChild(child);
        }
    }
    if (!isAdded) {
        const user = document.createElement('div');
        user.dataset.userId = this.dataset.userId;
        user.classList.add('addedUser');

        const img = document.createElement('img');
        if (this.dataset.userPic == 'null') {
            img.src = '/user_pics/default.svg';
        } else {
            img.src = '/user_pics/' + this.dataset.userPic;
        }
        img.classList.add('addedImg');

        const name = document.createElement('div');
        name.innerText = this.dataset.username;

        user.appendChild(img);
        user.appendChild(name);
        user.addEventListener('click', removeAddedUser);
        addedUsers.appendChild(user);

        this.classList.add('selected');
    }
    /*
    for(const child of addedUsers.children) {
        if(child.dataset.userId == this.dataset.userId) {
            addedUsers.removeChild(child);
        }
    }*/
}

function removeAddedUser() {
    const suggestionDiv = document.getElementById('newChatUserSuggestionList');
    let j = 0;
    while (
        j < suggestionDiv.children.length &&
        this.dataset.userId != suggestionDiv.children[j].dataset.userId
    ) {
        j++;
    }

    suggestionDiv.children[j].classList.remove('selected');

    const parent = this.parentNode;
    parent.removeChild(this);
}

async function createNewChat() {
    const form = document.getElementById('newChatForm');
    let formData = new FormData();
    formData.append('chatName', document.getElementById('newChatName').value);

    const addedUsers = document.querySelectorAll('.addedUser');

    if (addedUsers.length != 0) {
        let userIds = [];

        for (const user of addedUsers) {
            userIds.push(user.dataset.userId);
        }

        let { userId } = await GetMethodFetch('/api/sendUserId');
        userIds.push(userId);
        formData.append('userIds', userIds);

        let img = document.getElementById('newChatImgInput').files[0];
        let newImg = new File(
            [img],
            img.name
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/\.(?=.*\.)/g, '-'),
            {
                type: img.type
            }
        );

        formData.append('img', newImg);

        let errorMessage;
        let isValid = true;
        for (const value of formData.values()) {
            if (value == '') {
                isValid = false;
                errorMessage = 'Nem töltötte ki az összes mezőt!';
            }
            try {
                if (value.type.split('/')[0] != 'image') {
                    isValid = false;
                    errorMessage = 'Nem megfelelő formátumú fájl feltöltve!';
                }
            } catch (error) {}
        }

        if (isValid) {
            const { Status } = await filePost('/api/createChat', formData);

            if (Status == 'Success') {
                form.reset();
                closeNewChatWindow();
                getChats();
            } else {
                alert('Valami hiba történt');
            }
        } else {
            alert(errorMessage);
        }
    } else {
        alert('Nincs hozzáadott felhasználó!');
    }
}

async function filePost(url, data) {
    try {
        let response = await fetch(url, {
            method: 'POST',
            body: data
        });
        if (!response.ok) {
            throw new Error(response.status + ' ' + response.statusText);
        }
        return await response.json();
    } catch (error) {
        throw new Error(error);
    }
}

socket.on('newMessage', () => {
    refreshChat();
});
