const request = require('supertest');
const app = require('../app');
const ServiceCategory = require('../models/ServiceCategory');
const User = require('../models/User');

const describeDb = process.env.RUN_DB_TESTS === 'true' ? describe : describe.skip;

describeDb('Service Category Endpoints', () => {
  let adminToken;

  beforeAll(async () => {
    // Create an admin user for testing POST /api/services
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        role: 'ADMIN'
      });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'password123'
      });
      
    adminToken = res.body.token;
  });

  it('should get an empty list of categories initially', async () => {
    const res = await request(app).get('/api/services');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toEqual(0);
  });

  it('should allow admin to create a new service category', async () => {
    const res = await request(app)
      .post('/api/services')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Plumbing',
        description: 'Fixing pipes and leaks',
        icon: 'plumbing-icon.png'
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.name).toEqual('Plumbing');
  });

  it('should return the created category in the list', async () => {
    const res = await request(app).get('/api/services');
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toEqual(1);
    expect(res.body[0].name).toEqual('Plumbing');
  });

  it('should not allow unauthorized users to create a category', async () => {
    const res = await request(app)
      .post('/api/services')
      .send({
        name: 'Electrical',
        description: 'Wiring and lights'
      });
    expect(res.statusCode).toEqual(401); // 401 Unauthorized
  });
});
