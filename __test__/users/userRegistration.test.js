const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/model/User.model');
const sequelize = require('../../src/config/db');

beforeAll(() => {
  return sequelize.sync();
});

beforeEach(() => {
  return User.destroy({ truncate: true });
});

const validUser = {
  username: 'user1',
  email: 'user1@mail.com',
  password: 'Password1',
};

const postUser = (user = validUser, language = 'en') => {
  return request(app).post('/api/1.0/users').set('Accept-Language', language).send(user).expect('Content-Type', /json/);
};

describe('User Registration', () => {
  it('returns 200 OK when signup request is valid', async () => {
    const response = await postUser();
    expect(response.status).toBe(201);
  });

  it('returns success message when signup request is valid', async () => {
    const response = await postUser();
    expect(response.status).toBe(201);
    expect(response.body.message).toBe('User created successfully');
  });

  it('returns success message in Hindi when signup request is valid', async () => {
    const response = await postUser(validUser, 'hi');
    expect(response.status).toBe(201);
    expect(response.body.message).toBe('उपयोगकर्ता सफलतापूर्वक बनाया गया');
  });

  it('saves the user to database', async () => {
    await postUser();
    const userList = await User.findAll();
    expect(userList.length).toBe(1);
  });

  it('saves the email and username to database', async () => {
    await postUser();
    const userList = await User.findAll();
    const savedUser = userList[0];
    expect(savedUser.username).toBe('user1');
    expect(savedUser.email).toBe('user1@mail.com');
  });

  it('hashes the password then store to database', async () => {
    await postUser();
    const userList = await User.findAll();
    const savedUser = userList[0];
    expect(savedUser.password).not.toBe('password');
  });

  it('returns 400 when username is null', async () => {
    const response = await postUser({
      username: null,
      email: 'user1@mail.com',
      password: 'Password',
    });

    expect(response.status).toBe(400);
  });

  it('returns validationErrors field in response body when validation Error occurs', async () => {
    const response = await postUser({
      username: 'user1',
      email: null,
      password: 'Password',
    });

    expect(response.body.validationErrors).not.toBeUndefined();
  });

  it('returns errors for both when username and email is null', async () => {
    const response = await postUser({
      username: null,
      email: null,
      password: 'Password1',
    });

    const { validationErrors } = response.body;
    expect(Object.keys(validationErrors)).toEqual(['username', 'email']);
  });

  it.each`
    field         | lang    | value              | expectedMessage
    ${'username'} | ${'en'} | ${null}            | ${'Username cannot be null'}
    ${'username'} | ${'en'} | ${'usr'}           | ${'Must have min 4 and max 32 characters'}
    ${'username'} | ${'en'} | ${'a'.repeat(33)}  | ${'Must have min 4 and max 32 characters'}
    ${'email'}    | ${'en'} | ${null}            | ${'E-mail cannot be null'}
    ${'email'}    | ${'en'} | ${'mail.com'}      | ${'E-mail is not valid'}
    ${'email'}    | ${'en'} | ${'user.mail.com'} | ${'E-mail is not valid'}
    ${'email'}    | ${'en'} | ${'user@mail'}     | ${'E-mail is not valid'}
    ${'password'} | ${'en'} | ${null}            | ${'Password cannot be null'}
    ${'password'} | ${'en'} | ${'pass'}          | ${'Password must be at least 6 characters'}
    ${'password'} | ${'en'} | ${'alllowercase'}  | ${'Password must have at least 1 uppercase, 1 lowercase, and 1 number'}
    ${'password'} | ${'en'} | ${'ALLUPPERCASE'}  | ${'Password must have at least 1 uppercase, 1 lowercase, and 1 number'}
    ${'password'} | ${'en'} | ${'1234567890'}    | ${'Password must have at least 1 uppercase, 1 lowercase, and 1 number'}
    ${'password'} | ${'en'} | ${'lowerAndUPPER'} | ${'Password must have at least 1 uppercase, 1 lowercase, and 1 number'}
    ${'password'} | ${'en'} | ${'lowerand123'}   | ${'Password must have at least 1 uppercase, 1 lowercase, and 1 number'}
    ${'password'} | ${'en'} | ${'UPPERAND123'}   | ${'Password must have at least 1 uppercase, 1 lowercase, and 1 number'}
    ${'username'} | ${'hi'} | ${null}            | ${'उपयोगकर्ता रिक्त नहीं हो सकता'}
    ${'username'} | ${'hi'} | ${'usr'}           | ${'कम से कम 4 और अधिकतम 32 अक्षर होने चाहिए'}
    ${'username'} | ${'hi'} | ${'a'.repeat(33)}  | ${'कम से कम 4 और अधिकतम 32 अक्षर होने चाहिए'}
    ${'email'}    | ${'hi'} | ${null}            | ${'ईमेल रिक्त नहीं हो सकता'}
    ${'email'}    | ${'hi'} | ${'mail.com'}      | ${'ईमेल मान्य नहीं है'}
    ${'email'}    | ${'hi'} | ${'user.mail.com'} | ${'ईमेल मान्य नहीं है'}
    ${'email'}    | ${'hi'} | ${'user@mail'}     | ${'ईमेल मान्य नहीं है'}
    ${'password'} | ${'hi'} | ${null}            | ${'पासवर्ड रिक्त नहीं हो सकता'}
    ${'password'} | ${'hi'} | ${'pass'}          | ${'कम से कम 6 अक्षर होने चाहिए'}
    ${'password'} | ${'hi'} | ${'alllowercase'}  | ${'कम से कम 1 अपरकेस, 1 लोवरकेस और 1 संख्या होनी चाहिए'}
    ${'password'} | ${'hi'} | ${'ALLUPPERCASE'}  | ${'कम से कम 1 अपरकेस, 1 लोवरकेस और 1 संख्या होनी चाहिए'}
    ${'password'} | ${'hi'} | ${'1234567890'}    | ${'कम से कम 1 अपरकेस, 1 लोवरकेस और 1 संख्या होनी चाहिए'}
    ${'password'} | ${'hi'} | ${'lowerAndUPPER'} | ${'कम से कम 1 अपरकेस, 1 लोवरकेस और 1 संख्या होनी चाहिए'}
    ${'password'} | ${'hi'} | ${'lowerand123'}   | ${'कम से कम 1 अपरकेस, 1 लोवरकेस और 1 संख्या होनी चाहिए'}
    ${'password'} | ${'hi'} | ${'UPPERAND123'}   | ${'कम से कम 1 अपरकेस, 1 लोवरकेस और 1 संख्या होनी चाहिए'}
  `(
    'returns $expectedMessage when $field is $value in $lang language',
    async ({ field, expectedMessage, value, lang }) => {
      const user = {
        username: 'user1',
        email: 'user1@mail.com',
        password: 'password1',
      };
      user[field] = value;
      const response = await postUser(user, lang);
      expect(response.body.validationErrors[field]).toBe(expectedMessage);
    },
  );

  it('returns E-mail already exists when same email is provided again', async () => {
    await User.create({ ...validUser });
    const response = await postUser();
    // expect(response.status).toBe(409);
    expect(response.body.validationErrors.email).toBe('E-mail already exists');
  });

  it('returns E-mail already exists when same email is provided again', async () => {
    await User.create({ ...validUser });
    const response = await postUser(validUser, 'hi');
    // expect(response.status).toBe(409);
    expect(response.body.validationErrors.email).toBe('ईमेल पहले से मौजूद है');
  });

  it('returns errors for both E-mail already exists and username is null', async () => {
    await User.create({ ...validUser });
    const response = await postUser({
      username: null,
      email: validUser.email,
      password: 'Password1',
    });
    expect(Object.keys(response.body.validationErrors)).toStrictEqual(['username', 'email']);
  });

  //   it.each([
  //     ['username', 'Username cannot be null'],
  //     ['email', 'E-mail cannot be null'],
  //     ['password', 'Password cannot be null'],
  //   ])('when %s is null %s is received', async (field, expectedMessage) => {
  //     const user = {
  //       username: 'user1',
  //       email: 'user1@mail.com',
  //       password: 'password',
  //     };
  //     user[field] = null;
  //     const response = await postUser(user);
  //     expect(response.body.validationErrors[field]).toBe(expectedMessage);
  //   });

  //   it('returns Username cannot be null when username is null', async () => {
  //     const response = await postUser({
  //       username: null,
  //       email: 'user1@mail.com',
  //       password: 'Password',
  //     });

  //     const { validationErrors } = response.body;
  //     expect(validationErrors.username).toBe('Username cannot be null');
  //   });

  //   it('returns E-mail cannot be null when email is null', async () => {
  //     const response = await postUser({
  //       username: 'user1',
  //       email: null,
  //       password: 'Password',
  //     });

  //     const { validationErrors } = response.body;
  //     expect(validationErrors.email).toBe('E-mail cannot be null');
  //   });

  //   it('returns Password cannot be null when password is null', async () => {
  //     const response = await postUser({
  //       username: 'user1',
  //       email: 'user1@mail.com',
  //       password: null,
  //     });

  //     const { validationErrors } = response.body;
  //     expect(validationErrors.password).toBe('Password cannot be null');
  //   });
});
