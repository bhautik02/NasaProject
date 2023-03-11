const { mongoConnect, mongoDisconnect } = require('../../services/mongo');
const request = require('supertest');
const app = require('../../app');

// describe('Test GET /launches', () => {
//   test('It should respond with 200 success', () => {
//     const response = 200;
//     expect(response).toBe(200);
//   });
// });

// describe('Test POST /launches', () => {
//   test('It should responde with 200 success', () => {});
//   test('It should catch missing required properties', () => {});
//   test('It should catch invalid dates', () => {});
// });

describe('Testing Launch API', () => {
  beforeAll(async () => {
    await mongoConnect();
  });

  afterAll(async () => {
    await mongoDisconnect();
  });

  describe('Test GET /launches', () => {
    test('It should respond with 200 success.', async () => {
      const response = await request(app)
        .get('/v1/launches')
        .expect('Content-Type', /json/)
        .expect(200);
    });
  });

  describe('Test POST /launches', () => {
    const completeLaunchData = {
      mission: 'ISRO GAGANYAN',
      rocket: 'PSLV',
      target: 'Kepler-62 f',
      launchDate: 'January 11,2030',
    };

    const dataWithoutDate = {
      mission: 'ISRO GAGANYAN',
      rocket: 'PSLV',
      target: 'Kepler-62 f',
    };

    const completeLaunchDataInvalid = {
      mission: 'ISRO GAGANYAN',
      rocket: 'PSLV',
      target: 'Kepler-62 f',
      launchDate: 'invalid',
    };

    test('It should respond with 201 created.', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(completeLaunchData)
        .expect('Content-Type', /json/)
        .expect(201);

      const requestDate = new Date(completeLaunchData.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();

      expect(requestDate).toBe(responseDate);
      expect(response.body).toMatchObject(dataWithoutDate);
    });

    test('It should be catch missing required properties', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(dataWithoutDate)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: 'Missing required launch property',
      });
    });

    test('It should catch invalid date.', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(completeLaunchDataInvalid)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: 'Invalid launch date',
      });
    });
  });
});
