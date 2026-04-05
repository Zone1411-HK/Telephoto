const request = require('supertest');
const app = require('../app');

jest.mock('../sql/database.js', () => ({
    allUsername: jest.fn()
}));

const database = require('../sql/database');

beforeEach(() => {
    jest.clearAllMocks();
});

describe('GET: /isUsernameAvailable', () => {
    test('elérhető név: available: true, status: success', async () => {
        database.allUsername.mockResolvedValue([
            { username: 'RegiFelhasznalo1' },
            { username: 'RegiFelhasznalo2' }
        ]);

        const response = await request(app).get('/api/isUsernameAvailable/UjFelhasznalo');
        expect(response.statusCode).toBe(200);
        expect(response.body.available).toBe(true);
        expect(response.body.status).toBe('success');
    });
    test('meglévő név: available: false, status: failed', async () => {
        database.allUsername.mockResolvedValue([
            { username: 'RegiFelhasznalo1' },
            { username: 'RegiFelhasznalo2' }
        ]);

        const response = await request(app).get('/api/isUsernameAvailable/RegiFelhasznalo1');
        expect(response.statusCode).toBe(200);
        expect(response.body.available).toBe(false);
        expect(response.body.status).toBe('failed');
    });
    test('database hiba', async () => {
        database.allUsername.mockRejectedValue(new Error('Database error'));

        const response = await request(app).get('/api/isUsernameAvailable/asd');
        expect(response.statusCode).toBe(500);
        expect(response.body.status).toBe('failed');
    });
});
