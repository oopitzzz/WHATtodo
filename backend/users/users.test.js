const express = require('express');
const request = require('supertest');
const buildUsersRouter = require('.');

describe('users routes', () => {
  let app;
  let mockService;

  beforeEach(() => {
    mockService = {
      getProfile: jest.fn().mockResolvedValue({ user_id: 'user-1', email: 'test@example.com' }),
      updateProfile: jest.fn().mockResolvedValue({ user_id: 'user-1', nickname: 'Updated' }),
    };

    const router = buildUsersRouter({
      authMiddleware: (req, _res, next) => {
        req.user = { userId: 'user-1', email: 'test@example.com' };
        next();
      },
      userService: mockService,
    });

    app = express();
    app.use(express.json());
    app.use('/api/users', router);
  });

  it('should get profile', async () => {
    const res = await request(app).get('/api/users/me');
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('test@example.com');
    expect(mockService.getProfile).toHaveBeenCalledWith('user-1');
  });

  it('should update profile', async () => {
    const res = await request(app)
      .put('/api/users/me')
      .send({ nickname: 'Updated' });
    expect(res.status).toBe(200);
    expect(res.body.data.nickname).toBe('Updated');
    expect(mockService.updateProfile).toHaveBeenCalledWith('user-1', { nickname: 'Updated' });
  });
});
