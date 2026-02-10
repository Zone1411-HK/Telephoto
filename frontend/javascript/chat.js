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
    const doesChatIdExist = await GetMethodFetch('/api/sendChatId');
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

    const closeImg = document.createElement('img');
    closeImg.src = '/images/x(2).svg';

    closeButton.appendChild(closeImg);
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

    const svg = document.createElement('img');
    svg.src = '/images/send(1).svg';
    svg.classList.add('img-fluid');

    send.appendChild(svg);

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
        const chatId = await GetMethodFetch('/api/sendChatId');
        const id = chatId.Result;
        let username = await GetMethodFetch('/api/sendUsername');
        username = username.Result;
        socket.emit('chatId', id);
        const response = await PostMethodFetch('/api/sendMessage', {
            message: newMessage,
            chatId: chatId.Result,
            username: username
        });

        if ((response.Status = 'Failed')) {
            //TODO Hiba kezelés
        } else {
        }
    }
}

socket.on('newMessage', (msg) => {
    refreshChat();
});
