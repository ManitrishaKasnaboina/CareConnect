const request = require('supertest');
const app = require('../app');
const User = require('../models/User');

const describeDb = process.env.RUN_DB_TESTS === 'true' ? describe : describe.skip;

describeDb('Auth Endpoints', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'CUSTOMER'
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toEqual('Test User');
  });

  it('should login an existing user', async () => {
    // First register
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Login User',
        email: 'login@example.com',
        password: 'password123',
        role: 'CUSTOMER'
      });

    // Then login
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login@example.com',
        password: 'password123'
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should not login with wrong password', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Wrong Password User',
        email: 'wrong@example.com',
        password: 'password123',
        role: 'CUSTOMER'
      });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'wrong@example.com',
        password: 'wrongpassword'
      });
    expect(res.statusCode).toEqual(401);
  });
});
