//TODO DOM-os tesztek megírása

import * as util from '../../frontend/javascript/util.js';
import * as admin from '../../frontend/javascript/AdminPage/admin.js';
import { GetMethodFetch, PostMethodFetch } from '../../frontend/javascript/fetch.js';
import { registration } from '../../frontend/javascript/LoginPage/registration.js';
import * as chat from '../../frontend/javascript/MainPage/chat.js';
import * as uploadPost from '../../frontend/javascript/MainPage/uploadPost.js';
import * as profile from '../../frontend/javascript/profilePage/profile.js';
import { getMarkers } from '../../frontend/javascript/mapPage/map.js';
import { generateClip, generateRope } from '../../frontend/javascript/MainPage/post.js';
import { login } from '../../frontend/javascript/LoginPage/login.js';

jest.mock('../../frontend/javascript/fetch.js', () => ({
    GetMethodFetch: jest.fn(),
    PostMethodFetch: jest.fn()
}));

jest.mock('../../frontend/javascript/socket.js', () => ({
    socket: {
        on: jest.fn(),
        emit: jest.fn(),
        off: jest.fn(),
        disconnect: jest.fn()
    }
}));

beforeEach(() => {
    jest.clearAllMocks();
});

describe('FRONTEND: ', () => {
    describe('util.js:', () => {
        describe('date_yyyy_MM_dd', () => {
            test('Átlagos dátum', () => {
                expect(util.date_yyyy_MM_dd('Mar 25 2015')).toBe('2015-03-25');
            });
            test('December 31.', () => {
                expect(util.date_yyyy_MM_dd('Dec 31 2015')).toBe('2015-12-31');
            });
            test('Üres dátum', () => {
                expect(util.date_yyyy_MM_dd('')).toBe('');
            });
        });

        describe('date_yyyy_MM_dd_hh_mm', () => {
            test('Átlagos dátum, idővel', () => {
                expect(util.date_yyyy_MM_dd_hh_mm('2026-04-17 12:26:57')).toBe('2026-04-17 12:26');
            });
            test('December 31 23 óra 59 perc', () => {
                expect(util.date_yyyy_MM_dd_hh_mm('Dec 31 2020 23:59')).toBe('2020-12-31 23:59');
            });
            test('Üres dátum', () => {
                expect(util.date_yyyy_MM_dd_hh_mm('')).toBe('');
            });
        });

        describe('isLoggedIn', () => {
            test('Be van jelentkezve', async () => {
                GetMethodFetch.mockResolvedValue({
                    Status: 'Success',
                    exists: true,
                    Result: 'felhasználónév'
                });

                let result = await util.isLoggedIn();
                expect(result).toBe(true);
            });
            test('Nincs bejelentkezve', async () => {
                GetMethodFetch.mockResolvedValue({
                    Status: 'Failed',
                    exists: false
                });

                let result = await util.isLoggedIn();
                expect(result).toBe(false);
            });
            test('Hiba', async () => {
                GetMethodFetch.mockRejectedValue(new Error('Hiba az "/sendUsername" végpontban'));

                await expect(util.isLoggedIn()).rejects.toThrow(
                    'Hiba az "/sendUsername" végpontban'
                );
            });
        });

        describe('isAdmin', () => {
            test('A felhasználó admin', async () => {
                GetMethodFetch.mockResolvedValue({
                    Status: 'success'
                });

                let result = await util.isAdmin();
                expect(result).toBe(true);
            });
            test('A felhasználó nem admin', async () => {
                GetMethodFetch.mockResolvedValue({
                    Status: 'Failed'
                });

                let result = await util.isAdmin();
                await expect(result).toBe(false);
            });
            test('Hiba', async () => {
                GetMethodFetch.mockRejectedValue(new Error('Hiba az "/isAdmin" végpontban'));

                await expect(util.isAdmin()).rejects.toThrow('Hiba az "/isAdmin" végpontban');
            });
        });

        describe('generateSlideshow', () => {
            test('Sikeres slideshow generálás', () => {
                let links = ['link1.png', 'link2.mp4'];

                let result = util.generateSlideshow('', links);
                let slideshowPartsLength = result.children[0].children.length;
                let contentLength = result.children[0].children[1].children.length;

                //[previous, slideshow, next], [<img link1>, <video link2>]
                expect([slideshowPartsLength, contentLength]).toStrictEqual([3, 2]);
            });
            test('Üres slideshow generálás (links = undefined)', () => {
                let links = undefined;
                let result = util.generateSlideshow('', links);

                //<div>
                expect(result.children.length).toBe(0);
            });
            test('Üres slideshow generálás (links = [])', () => {
                let links = [];
                let result = util.generateSlideshow('', links);

                //<div>
                expect(result.children.length).toBe(0);
            });
        });

        describe('generateTimestamp', () => {
            test('Sikeres timestamp generálás', () => {
                let rawDate = '2026-04-18T10:52:09.000Z';

                //<div>2026-04-18</div>
                let result = util.generateTimestamp(rawDate);
                expect(result.innerText).toBe('2026-04-18');
            });
            test('Üres timestamp generálás (rawDate = "")', () => {
                let rawDate = '';

                //<div></div>
                let result = util.generateTimestamp(rawDate);
                expect(result.innerText).toBe(undefined);
            });
            test('Üres timestamp generálás (rawDate = undefined)', () => {
                let rawDate = undefined;

                //<div></div>
                let result = util.generateTimestamp(rawDate);
                expect(result.innerText).toBe(undefined);
            });
        });

        describe('generateTags', () => {
            test('Sikeres tag, location generálás', () => {
                let tags = '#tag1#tag2';
                let tagsArray = ['#tag1', '#tag2'];
                let location = 'location';

                let isTagsValid = true;
                let isLocationValid = true;

                let result = util.generateTags(tags, location);

                for (let i = 1; i < result.children.length; i++) {
                    if (result.children[i].innerText != tagsArray[i - 1]) isTagsValid = false;
                }

                if (!result.children[0].innerHTML.includes('location')) isLocationValid = false;

                expect([isTagsValid, isLocationValid]).toStrictEqual([true, true]);
            });
            test('Sikeres tag generálás (tags = "")', () => {
                let tags = '';
                let tagsArray = [];
                let location = 'location';

                let isTagsValid = true;
                let isLocationValid = true;

                let result = util.generateTags(tags, location);

                for (let i = 1; i < result.children.length; i++) {
                    if (result.children[i].innerText != tagsArray[i - 1]) isTagsValid = false;
                }

                if (!result.children[0].innerHTML.includes('location')) isLocationValid = false;

                expect([isTagsValid, isLocationValid]).toStrictEqual([true, true]);
            });
            test('Sikeres tag generálás (location = "")', () => {
                let tags = '#tag1#tag2';
                let tagsArray = ['#tag1', '#tag2'];
                let location = '';

                let isTagsValid = true;
                let isLocationValid = true;

                let result = util.generateTags(tags, location);

                for (let i = 0; i < result.children.length; i++) {
                    if (result.children[i].innerText != tagsArray[i]) isTagsValid = false;
                }

                expect([isTagsValid, isLocationValid]).toStrictEqual([true, true]);
            });
            test('Üres tag generálás (location = "", tags = "")', () => {
                let tags = '';
                let location = '';

                let result = util.generateTags(tags, location);

                expect(result.innerHTML).toBe('');
            });
        });

        describe('generateDescription', () => {
            test('Sikeres description generálás', () => {
                let description = 'Template description';

                //<div>Template description</div>
                let result = util.generateDescription(description);
                expect(result.innerText).toBe('Template description');
            });
            test('Üres description generálás (description = "")', () => {
                let description = '';

                //<div></div>
                let result = util.generateDescription(description);
                expect(result.innerText).toBe('');
            });
            test('Üres description generálás (description = undefined)', () => {
                let description = undefined;

                //<div></div>
                let result = util.generateDescription(description);
                expect(result.innerText).toBe(undefined);
            });
        });

        describe('generateInteractions', () => {
            test('Sikeres interactions generálás', () => {
                let params = [1, 0, 1, 1, 100, 10];

                let result = util.generateInteractions(...params);
                let isValid = true;

                console.log(result.children.length);

                //minden button megfelelően legenerálódott
                if (result.children.length == 4) {
                    let like = result.children[0];
                    let favorite = result.children[1];
                    let comment = result.children[2];
                    let dislike = result.children[3];

                    //100 like-nak kell benne lennie
                    if (!like.innerHTML.includes('100')) isValid = false;
                    //a like-nak aktívnak kell lennie
                    if (!like.classList.contains('activeLike')) isValid = false;

                    //a kedvencnek aktívnak kell lennie
                    if (!favorite.classList.contains('activeFavorite')) isValid = false;

                    //ne legyen üres a comment innerHTML-e
                    if (comment.innerHTML == '' || comment.innerHTML == undefined) isValid = false;

                    //10 dislike-nak kell benne lennie
                    if (!dislike.innerHTML.includes('10')) isValid = false;

                    //a dislike-nak nem szabad aktívnak lennie
                    if (dislike.classList.contains('activeLike')) isValid = false;
                } else {
                    isValid = false;
                }

                expect(isValid).toBe(true);
            });
        });

        describe('generateUserRow', () => {
            test('Sikeres user row generálás', () => {
                let params = ['felhasználónév', 'test.png'];

                let result = util.generateUserRow(...params);
                let img = result.children[0].children[0].children[0];
                let name = result.children[0].children[1];

                expect([
                    result.children.length,
                    img.src.includes('/profile_images/test.png'),
                    name.innerText == params[0]
                ]).toStrictEqual([2, true, true]);
            });
            test('Sikeres user row generálás, (profilePicture = undefined)', () => {
                let params = ['felhasználónév', undefined];

                let result = util.generateUserRow(...params);
                let img = result.children[0].children[0].children[0];
                let name = result.children[0].children[1];

                expect([
                    result.children.length,
                    img.src.includes('/profile_images/defaultProfile.jpg'),
                    name.innerText == params[0]
                ]).toStrictEqual([2, true, true]);
            });
            test('Sikeres user row generálás, (profilePicture = "")', () => {
                let params = ['felhasználónév', ''];

                let result = util.generateUserRow(...params);
                let img = result.children[0].children[0].children[0];
                let name = result.children[0].children[1];

                expect([
                    result.children.length,
                    img.src.includes('/profile_images/defaultProfile.jpg'),
                    name.innerText == params[0]
                ]).toStrictEqual([2, true, true]);
            });
        });

        describe('generateCommentProfilePicture', () => {
            test('Sikeres comment profile picture generálás', () => {
                let params = ['test.png', 'felhasználónév'];

                let result = util.generateCommentProfilePicture(...params);
                let img = result.children[0].children[0];

                expect(img.src.includes('test.png')).toBe(true);
            });
            test('Sikeres comment profile picture generálás (src = "")', () => {
                let params = ['', 'felhasználónév'];

                let result = util.generateCommentProfilePicture(...params);
                let img = result.children[0].children[0];

                expect(img.src.includes('defaultProfile.jpg')).toBe(true);
            });
            test('Sikeres comment profile picture generálás (src = undefined)', () => {
                let params = [undefined, 'felhasználónév'];

                let result = util.generateCommentProfilePicture(...params);
                let img = result.children[0].children[0];

                expect(img.src.includes('defaultProfile.jpg')).toBe(true);
            });
        });

        describe('generateCommentContent', () => {
            test('Sikeres comment content generálás', () => {
                let content = 'lorem ipsum';

                let result = util.generateCommentContent(content);

                expect(result.children[0].innerText).toBe(content);
            });
            test('Üres comment content generálás', () => {
                let content = '';

                let result = util.generateCommentContent(content);

                expect(result.children[0].innerText).toBe('');
            });
        });

        describe('generateCommentUsername', () => {
            test('Sikeres comment username generálás', () => {
                let username = 'felhasználónév';

                let result = util.generateCommentUsername(username);

                expect(result.children[0].innerText).toBe(username + ':');
            });
            test('Üres comment username generálás', () => {
                let username = '';

                let result = util.generateCommentUsername(username);

                expect(result.children[0].innerText).toBe(username + ':');
            });
        });

        describe('generateCommentDate', () => {
            test('Sikeres comment date generálás', () => {
                {
                    let date = '2026-04-19 12:03:55';

                    let result = util.generateCommentDate(date);

                    expect(result.children[0].innerText).toBe(`2026-04-19\n12:03`);
                }
            });
        });

        describe('generateComment', () => {
            test('Sikeres comment generálás', () => {
                let commentData = {
                    profile_picture_link: 'test.png',
                    username: 'felhasználónév',
                    comment_content: 'lorem ipsum',
                    comment_date: '2026-04-19 12:03:55'
                };

                let result = util.generateComment(commentData);

                expect([result.children.length, result.children[1].children.length]).toStrictEqual([
                    2, 4
                ]);
            });
        });
    });

    describe('admin.js: ', () => {
        describe('convertToTime', () => {
            test('Átlagos idő', () => {
                //1670414605000 = (2022-12-07 12:03:25) + GMT + 1
                let result = admin.convertToTime(1670414605000);
                expect(result).toBe('13:03');
            });
            test('0', () => {
                //0 = (1970-01-01 12:00:00) + GMT + 1
                let result = admin.convertToTime(0);
                expect(result).toBe('1:00');
            });
        });
        describe('sortArray', () => {
            test('Átlagos array', () => {
                let arr;
                let result = admin.sortArray([1, 3, 2, 5, 4]);
                expect(result).toStrictEqual([1, 2, 3, 4, 5]);
            });
            test('1 elemes array', () => {
                let result = admin.sortArray([1]);
                expect(result).toStrictEqual([1]);
            });
            test('array duplikációval', () => {
                let result = admin.sortArray([2, 1, 1, 3, 2, 5]);
                expect(result).toStrictEqual([1, 1, 2, 2, 3, 5]);
            });
        });
    });

    describe('registration.js: ', () => {
        describe('registration:', () => {
            test('Sikeres regisztráció', async () => {
                document.body.innerHTML = `
                        <input
                            id="registrationUsername"
                            class="registrationInput"
                            type="text"
                            value="felhasználónév"
                        />
                        <input
                            id="registrationEmail"
                            class="registrationInput"
                            type="text"
                            value="a@a.com"
                        />
                        <input
                            id="registrationPassword"
                            class="registrationInput"
                            type="password"
                            value="1234567."
                        />
                        <input
                            id="registrationPasswordConfirm"
                            class="registrationInput"
                            type="password"
                            value="1234567."
                        />
            `;

                GetMethodFetch.mockResolvedValue({ available: true });
                PostMethodFetch.mockResolvedValue({ status: 'Successful registration' });

                let result = await registration();
                expect(result.success).toBe(true);
            });

            test('Foglalt felhasználónév', async () => {
                document.body.innerHTML = `
                        <input
                            id="registrationUsername"
                            class="registrationInput"
                            type="text"
                            value="felhasználónév"
                        />
                        <input
                            id="registrationEmail"
                            class="registrationInput"
                            type="text"
                            value="a@a.com"
                        />
                        <input
                            id="registrationPassword"
                            class="registrationInput"
                            type="password"
                            value="1234567."
                        />
                        <input
                            id="registrationPasswordConfirm"
                            class="registrationInput"
                            type="password"
                            value="1234567."
                        />
            `;

                GetMethodFetch.mockResolvedValue({ available: false });

                let result = await registration();
                expect(result).toStrictEqual({
                    success: false,
                    errorMessage: 'Ez a felhasználónév már foglalt!\n'
                });
            });

            test('A két jelszó nem egyezik', async () => {
                document.body.innerHTML = `
                        <input
                            id="registrationUsername"
                            class="registrationInput"
                            type="text"
                            value="felhasználónév"
                        />
                        <input
                            id="registrationEmail"
                            class="registrationInput"
                            type="text"
                            value="a@a.com"
                        />
                        <input
                            id="registrationPassword"
                            class="registrationInput"
                            type="password"
                            value="12345678."
                        />
                        <input
                            id="registrationPasswordConfirm"
                            class="registrationInput"
                            type="password"
                            value="1234567."
                        />
            `;

                GetMethodFetch.mockResolvedValue({ available: true });

                let result = await registration();
                expect(result).toStrictEqual({
                    success: false,
                    errorMessage: 'A két jelszó nem egyezik meg!\n'
                });
            });

            test('A jelszó nem elég erős', async () => {
                document.body.innerHTML = `
                        <input
                            id="registrationUsername"
                            class="registrationInput"
                            type="text"
                            value="felhasználónév"
                        />
                        <input
                            id="registrationEmail"
                            class="registrationInput"
                            type="text"
                            value="a@a.com"
                        />
                        <input
                            id="registrationPassword"
                            class="registrationInput"
                            type="password"
                            value="1"
                        />
                        <input
                            id="registrationPasswordConfirm"
                            class="registrationInput"
                            type="password"
                            value="1"
                        />
            `;

                GetMethodFetch.mockResolvedValue({ available: true });

                let result = await registration();
                expect(result).toStrictEqual({
                    success: false,
                    errorMessage: 'A jelszó nem elég erős!\n'
                });
            });

            test('Nem megfelelő email formátum', async () => {
                document.body.innerHTML = `
                        <input
                            id="registrationUsername"
                            class="registrationInput"
                            type="text"
                            value="felhasználónév"
                        />
                        <input
                            id="registrationEmail"
                            class="registrationInput"
                            type="text"
                            value="aa.com"
                        />
                        <input
                            id="registrationPassword"
                            class="registrationInput"
                            type="password"
                            value="1234567."
                        />
                        <input
                            id="registrationPasswordConfirm"
                            class="registrationInput"
                            type="password"
                            value="1234567."
                        />
            `;

                GetMethodFetch.mockResolvedValue({ available: true });

                let result = await registration();
                expect(result).toStrictEqual({
                    success: false,
                    errorMessage: 'Nem megfelelő e-mail formátum!\n'
                });
            });

            test('Nem elég hosszú felhasználónév', async () => {
                document.body.innerHTML = `
                        <input
                            id="registrationUsername"
                            class="registrationInput"
                            type="text"
                            value="a"
                        />
                        <input
                            id="registrationEmail"
                            class="registrationInput"
                            type="text"
                            value="a@a.com"
                        />
                        <input
                            id="registrationPassword"
                            class="registrationInput"
                            type="password"
                            value="1234567."
                        />
                        <input
                            id="registrationPasswordConfirm"
                            class="registrationInput"
                            type="password"
                            value="1234567."
                        />
            `;

                let result = await registration();
                expect(result).toStrictEqual({
                    success: false,
                    errorMessage: 'Nem elég hosszú felhasználónév!\n'
                });
            });

            test('Foglalt felhasználónév, a két jelszó nem egyezik, a jelszó nem elég erős, nem megfelelő email formátum', async () => {
                document.body.innerHTML = `
                        <input
                            id="registrationUsername"
                            class="registrationInput"
                            type="text"
                            value="felhasználónév"
                        />
                        <input
                            id="registrationEmail"
                            class="registrationInput"
                            type="text"
                            value="aa.com"
                        />
                        <input
                            id="registrationPassword"
                            class="registrationInput"
                            type="password"
                            value="1"
                        />
                        <input
                            id="registrationPasswordConfirm"
                            class="registrationInput"
                            type="password"
                            value="1234567."
                        />
            `;
                GetMethodFetch.mockResolvedValue({ available: false });

                let result = await registration();
                expect(result).toStrictEqual({
                    success: false,
                    errorMessage:
                        'Ez a felhasználónév már foglalt!\nNem megfelelő e-mail formátum!\nA jelszó nem elég erős!\nA két jelszó nem egyezik meg!\n'
                });
            });
        });
    });

    describe('login.js:', () => {
        describe('login', () => {
            test('Sikeres bejelentkezés', async () => {
                document.body.innerHTML = `
                        <input
                            id="loginUsername"
                            type="text"
                            value="felhasználónév"
                        />
                        <input
                            id="loginPassword"
                            type="password"
                            value="1234567."
                        />`;

                PostMethodFetch.mockResolvedValue({ isLoggedIn: true });

                let result = await login();
                expect(result).toBe(true);
            });
            test('Sikertelen bejelentkezés', async () => {
                document.body.innerHTML = `
                        <input
                            id="loginUsername"
                            type="text"
                            value="felhasználónév"
                        />
                        <input
                            id="loginPassword"
                            type="password"
                            value="1234567."
                        />`;

                PostMethodFetch.mockResolvedValue({ isLoggedIn: false });

                let result = await login();
                expect(result).toBe(false);
            });
            test('Sikertelen bejelentkezés (nem adott meg jelszót)', async () => {
                document.body.innerHTML = `
                        <input
                            id="loginUsername"
                            type="text"
                            value="felhasználónév"
                        />
                        <input
                            id="loginPassword"
                            type="password"
                            value=""
                        />`;

                let result = await login();
                expect(result).toBe(false);
            });
            test('Sikertelen bejelentkezés (nem adott meg felhasználónevet)', async () => {
                document.body.innerHTML = `
                        <input
                            id="loginUsername"
                            type="text"
                            value=""
                        />
                        <input
                            id="loginPassword"
                            type="password"
                            value="1234567."
                        />`;

                let result = await login();
                expect(result).toBe(false);
            });
        });
    });

    describe('chat.js: ', () => {
        describe('getChatData: ', () => {
            test('2db beszélgetés', async () => {
                GetMethodFetch.mockResolvedValueOnce({ Result: 'felhasználónév' });
                GetMethodFetch.mockResolvedValueOnce({
                    Result: [
                        { chat_id: 1, chat_name: 'beszélgetés1', chat_picture_link: 'test.png' },
                        { chat_id: 2, chat_name: 'beszélgetés2', chat_picture_link: 'test.jpg' }
                    ]
                });
                GetMethodFetch.mockResolvedValueOnce({
                    Status: 'Success',
                    Result: { message: 'Hello', username: 'név' }
                });

                GetMethodFetch.mockResolvedValueOnce({
                    Status: 'Success',
                    Result: { message: 'World', username: 'név' }
                });

                let result = await chat.getChatData();
                expect(result).toStrictEqual([
                    new chat.ChatData(1, 'beszélgetés1', 'test.png', 'Hello', 'név'),
                    new chat.ChatData(2, 'beszélgetés2', 'test.jpg', 'World', 'név')
                ]);
            });

            test('0db beszélgetés', async () => {
                GetMethodFetch.mockResolvedValueOnce({ Result: 'felhasználónév' });
                GetMethodFetch.mockResolvedValueOnce({
                    Result: []
                });
                let result = await chat.getChatData();
                expect(result).toStrictEqual([]);
            });
            test('Nincs felhasználónév', async () => {
                GetMethodFetch.mockRejectedValue(new Error('Hiba az "/sendUsername" végpontban'));

                await expect(chat.getChatData()).rejects.toThrow(
                    'Hiba az "/sendUsername" végpontban'
                );
            });
        });

        describe('generateMessage', () => {
            test('Sikeres message generálás (a jelenlegi felhasználó küldte az üzenetet)', () => {
                let params = ['felhasználónév', 'felhasználónév', 'üzenet', '2026-04-18 12:33:07'];
                let result = chat.generateMessage(...params);
                let messageContent = result.children[0].children[0];
                let messageDate = result.children[0].children[1];

                expect([
                    messageContent.classList.contains(
                        'FromCurrentUserColor',
                        'FromCurrentUserSide'
                    ),
                    messageDate.classList.contains('FromCurrentUserSide')
                ]).toStrictEqual([true, true]);
            });
            test('Sikeres message generálás (egy másik felhasználó küldte az üzenetet)', () => {
                let params = [
                    'felhasználónév',
                    'másFelhasználónév',
                    'üzenet',
                    '2026-04-18 12:33:07'
                ];
                let result = chat.generateMessage(...params);
                let messageContent = result.children[0].children[0];
                let messageDate = result.children[0].children[1];

                expect([
                    messageContent.classList.contains('FromOtherUserColor', 'FromOtherUserSide'),
                    messageDate.classList.contains('FromOtherUserSide')
                ]).toStrictEqual([true, true]);
            });
        });

        describe('generateMessageInput', () => {
            test('Sikeres message input generálás', () => {
                let result = chat.generateMessageInput();
                expect(result.children.length).toBe(2);
            });
        });
    });

    describe('uploadPost.js: ', () => {
        describe('rightFileFormats', () => {
            test('Minden fájl formátuma helyes', () => {
                let files = [
                    new File(['test'], 'test.png', { type: 'image/png' }),
                    new File(['test'], 'test.mp4', { type: 'video/mp4' })
                ];

                let valid = true;
                for (let file of files) {
                    if (!uploadPost.fileFormats(file.type.split('/')[1])) valid = false;
                }
                expect(valid).toBe(true);
            });
            test('1 fájlnak helytelen a formátuma', () => {
                let files = [
                    new File(['test'], 'test.txt', { type: 'text/txt' }),
                    new File(['test'], 'test.png', { type: 'image/jpg' })
                ];

                let valid = true;
                for (let file of files) {
                    if (!uploadPost.fileFormats(file.type.split('/')[1])) valid = false;
                }
                expect(valid).toBe(false);
            });
            test('Minden fájl formátuma helytelen', () => {
                let files = [
                    new File(['test'], 'test.txt', { type: 'text/txt' }),
                    new File(['test'], 'test.txt', { type: 'text/txt' })
                ];

                let valid = true;
                for (let file of files) {
                    if (!uploadPost.fileFormats(file.type.split('/')[1])) valid = false;
                }
                expect(valid).toBe(false);
            });
        });
    });

    describe('profile.js:', () => {
        describe('isImageFormat: ', () => {
            test('Helyes formátum', () => {
                let result = profile.isImageFormat(new File(['test'], 'test.png'));
                expect(result).toBe(true);
            });
            test('Helytelen formátum', () => {
                let result = profile.isImageFormat(new File(['test'], 'test.txt'));
                expect(result).toBe(false);
            });
            test('Hiányzó fájl', () => {
                let result = profile.isImageFormat(undefined);
                expect(result).toBe(false);
            });
        });

        describe('generatePostDelete', () => {
            test('Sikeres post delete generálás', () => {
                let result = profile.generatePostDelete();

                expect(result.innerHTML != '' || result.innerHTML != undefined).toBe(true);
            });
        });
    });

    describe('map.js:', () => {
        describe('getMarkers', () => {
            test('Sikeres marker lekérés', async () => {
                GetMethodFetch.mockResolvedValue({
                    Status: 'success',
                    Markers: [
                        { post_id: 1, latitude: 1, longitude: 1, picture_link: 'test.png' },
                        { post_id: 2, latitude: 2, longitude: 2, picture_link: 'test.mp4' }
                    ]
                });

                let result = await getMarkers();
                expect(result).toStrictEqual([
                    { post_id: 1, latitude: 1, longitude: 1, picture_link: 'test.png' },
                    { post_id: 2, latitude: 2, longitude: 2, picture_link: 'test.mp4' }
                ]);
            });
            test('Sikeres marker lekérés (0 marker)', async () => {
                GetMethodFetch.mockResolvedValue({
                    Status: 'success',
                    Markers: []
                });

                let result = await getMarkers();
                expect(result).toStrictEqual([]);
            });
        });
    });

    describe('post.js: ', () => {
        describe('generateClip', () => {
            test('Sikeres clip generálás', () => {
                let result = generateClip();

                expect(result.children.length).toBe(2);
            });
        });
        describe('generateRope', () => {
            test('Sikeres rope generálás', () => {
                let result = generateRope();

                expect(result.children.length).toBe(2);
            });
        });
    });
});
