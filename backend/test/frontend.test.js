//TODO DOM-os tesztek megírása

import * as util from '../../frontend/javascript/util.js';
import * as admin from '../../frontend/javascript/AdminPage/admin.js';
import { GetMethodFetch, PostMethodFetch } from '../../frontend/javascript/fetch.js';
import { registration } from '../../frontend/javascript/LoginPage/registration.js';
import * as chat from '../../frontend/javascript/MainPage/chat.js';
import * as uploadPost from '../../frontend/javascript/MainPage/uploadPost.js';
import { isImageFormat } from '../../frontend/javascript/profilePage/profile.js';

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
        });

        describe('date_yyyy_MM_dd_hh_mm', () => {
            test('Átlagos dátum, idővel', () => {
                expect(util.date_yyyy_MM_dd_hh_mm('2026-04-17 12:26:57')).toBe('2026-04-17 12:26');
            });
            test('December 31 23 óra 59 perc', () => {
                expect(util.date_yyyy_MM_dd_hh_mm('Dec 31 2020 23:59')).toBe('2020-12-31 23:59');
            });
            test('időzóna ne rontsa el', () => {
                expect(util.date_yyyy_MM_dd_hh_mm('2000-01-01T10:00')).toBe('2000-01-01 10:00');
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

        test('Nincs megadott felhasználónév', async () => {
            document.body.innerHTML = `
                        <input
                            id="registrationUsername"
                            class="registrationInput"
                            type="text"
                            value=""
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
                errorMessage: 'Nem adott meg felhasználónevet!\n'
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
                console.log(result);
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
                console.log(result);
                expect(result).toStrictEqual([]);
            });
            test('Nincs felhasználónév', async () => {
                GetMethodFetch.mockRejectedValue(new Error('Hiba az "/sendUsername" végpontban'));

                await expect(chat.getChatData()).rejects.toThrow(
                    'Hiba az "/sendUsername" végpontban'
                );
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
                let result = isImageFormat(new File(['test'], 'test.png'));
                expect(result).toBe(true);
            });
            test('Helytelen formátum', () => {
                let result = isImageFormat(new File(['test'], 'test.txt'));
                expect(result).toBe(false);
            });
            test('Hiányzó fájl', () => {
                let result = isImageFormat(undefined);
                expect(result).toBe(false);
            });
        });
    });
});
