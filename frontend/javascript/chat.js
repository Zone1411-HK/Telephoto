class ChatData {
    constructor(id, name, pictureLink, lastMessage, userOfLastMessage) {
        this.id = id;
        this.name = name;
        this.pictureLink = pictureLink;
        this.lastMessage = lastMessage;
        this.userOfLastMessage = userOfLastMessage;
    }
}

async function getChats() {
    sessionStorage.setItem('username', 'mxn');
    let chatArray = await getChatData();
    if (Array.isArray(chatArray)) {
        const existingChats = document.getElementById('existingChats');
        for (const chat of chatArray) {
            const chatDiv = document.createElement('div');
            chatDiv.classList.add('chat');

            const chatImgDiv = document.createElement('div');
            chatImgDiv.classList.add('chatImgDiv');

            const chatImgBorder = document.createElement('div');
            chatImgBorder.classList.add('chatImgBorder');

            const chatImg = document.createElement('img');
            chatImg.classList.add('chatImg');
            chatImg.src = '/images/' + chat.pictureLink;
            chatImgBorder.appendChild(chatImg);

            chatImgDiv.appendChild(chatImgBorder);

            chatDiv.appendChild(chatImgDiv);

            const chatTexts = document.createElement('div');
            chatTexts.classList.add('chatTexts');

            const chatName = document.createElement('h3');
            chatName.innerHTML = chat.name;
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
        }
    } else {
        console.error(chatArray);
    }
}

async function getChatData() {
    try {
        let chatArray = [];
        const username = sessionStorage.getItem('username');
        const chatsResponse = await GetMethodFetch('/api/chatsOfUser/' + username);
        const result = chatsResponse.Result;
        console.log(result);
        for (const obj of result) {
            const lastMessageResponse = await GetMethodFetch(
                '/api/lastMessageOfChat/' + obj.chat_id
            );
            console.log(lastMessageResponse);
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

async function openChat() {
    const chatId = this.dataset.id;
    console.log(chatId);
    const chatContainer = document.getElementById('chatContainer');
    chatContainer.classList.add('invisible');

    const openedChat = document.getElementById('openedChat');
    openedChat.classList.remove('invisible');
    openedChat.replaceChildren();

    const nav = document.createElement('div');
    nav.classList.add('openedChatNav');

    const chatNameDiv = document.createElement('div');
    chatNameDiv.classList.add('openedChatName');

    const chatName = document.createElement('h3');
    chatName.innerText = this.dataset.name;
    chatNameDiv.appendChild(chatName);

    nav.appendChild(chatNameDiv);
    const response = await GetMethodFetch('/api/messagesOfChat/' + chatId);
    console.log(response);

    openedChat.appendChild(nav);

    const messagesDiv = document.createElement('div');
    messagesDiv.classList.add('messagesDiv');

    if (response.Result.length > 0) {
        for (let i = 0; i < 5; i++) {
            for (const obj of response.Result) {
                const messageRow = generateMessage(
                    obj.username == sessionStorage.getItem('username') ? true : false,
                    obj.message,
                    obj.message_date
                );
                messagesDiv.appendChild(messageRow);
            }
        }
    } else {
    }

    const newMessageDiv = document.createElement('div');
    newMessageDiv.classList.add('newMessageDiv');

    const newMessageInput = document.createElement('textarea');
    newMessageInput.placeholder = 'Új üzenet';
    newMessageInput.style.height = '100%';
    newMessageInput.maxLength = 200;
    newMessageInput.addEventListener('input', growHeight);
    newMessageDiv.appendChild(newMessageInput);

    const newMessageSend = document.createElement('input');
    newMessageSend.type = 'button';
    newMessageSend.value = 'Küldés';
    newMessageDiv.appendChild(newMessageSend);

    openedChat.appendChild(messagesDiv);
    openedChat.appendChild(newMessageDiv);
}

function generateMessage(fromCurrentUser, message, date) {
    const messageRow = document.createElement('div');
    messageRow.classList.add('messageRow');

    const messageContent = document.createElement('p');
    messageContent.classList.add('message');
    messageContent.innerText = message;

    const messageDate = document.createElement('p');
    messageDate.classList.add('messageDate');
    messageDate.innerText = date;

    const messageWrapper = document.createElement('div');
    messageWrapper.classList.add('messageWrapper');

    if (fromCurrentUser) {
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
function growHeight() {
    this.style.height = 0;
    this.style.height = this.scrollHeight + 'px';
}
