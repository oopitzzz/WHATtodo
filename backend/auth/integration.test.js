const request = require('supertest');

jest.mock('../_lib/middleware/cors', () => (req, res, next) => next());
jest.mock('../_lib/middleware/logger', () => (req, res, next) => next());
jest.mock('./signup', () => (req, res) => res.status(201).json({ ok: true, route: 'signup' }));
jest.mock('./login', () => (req, res) => res.status(200).json({ ok: true, route: 'login' }));
jest.mock('./logout', () => (req, res) => res.status(200).json({ ok: true, route: 'logout' }));
jest.mock('./refresh', () => (req, res) => res.status(200).json({ ok: true, route: 'refresh' }));

const app = require('../index');

describe('Auth API integration (with mocked handlers)', () => {
  it('should respond health check', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('should call mocked signup handler', async () => {
    const res = await request(app).post('/api/auth/signup').send({ email: 'a@b.com', password: 'pass', nickname: 'n' });
    expect(res.status).toBe(201);
    expect(res.body.route).toBe('signup');
  });

  it('should call mocked login handler', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'a@b.com', password: 'pass' });
    expect(res.status).toBe(200);
    expect(res.body.route).toBe('login');
  });

  it('should call mocked refresh handler', async () => {
    const res = await request(app).post('/api/auth/refresh').send({ refreshToken: 'token' });
    expect(res.status).toBe(200);
    expect(res.body.route).toBe('refresh');
  });

  it('should call mocked logout handler', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(200);
    expect(res.body.route).toBe('logout');
  });
});
