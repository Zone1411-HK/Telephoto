import * as util from '../../frontend/javascript/util.js';
import { GetMethodFetch, PostMethodFetch } from '../../frontend/javascript/fetch.js';

jest.mock('../../frontend/javascript/fetch.js', () => ({
    GetMethodFetch: jest.fn(),
    PostMethodFetch: jest.fn()
}));

beforeEach(() => {
    jest.clearAllMocks();
});

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
        GetMethodFetch.mockRejectedValue({
            Status: 'Failed',
            Message: 'A "/sendUsername" végpont nem működik!'
        });

        let result = await util.isLoggedIn();
        expect(result).toBe(false);
    });
});

describe('isAdmin', () => {
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
        GetMethodFetch.mockRejectedValue({
            Status: 'Failed',
            Message: 'A "/sendUsername" végpont nem működik!'
        });

        let result = await util.isLoggedIn();
        expect(result).toBe(false);
    });
});
