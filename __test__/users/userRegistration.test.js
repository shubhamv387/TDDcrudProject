const request = require('supertest')
const app = require('../../src/app')
const User = require('../../src/model/User.model')

beforeEach(() => {
  return User.destroy({ truncate: true })
})

jest.mock('nodemailer', () => require('../../__mocks__/mockUtils').mockNodemailer)

const validUser = {
  username: 'user1',
  email: 'user1@mail.com',
  password: 'Password1',
}

const postUser = (user = validUser, language = 'en') => {
  return request(app).post('/api/1.0/users').set('Accept-Language', language).send(user).expect('Content-Type', /json/)
}

describe('User Registration', () => {
  it('returns a custom error message with status 404 when an invalid route getting called', async () => {
    const response = await request(app).get('/invalid-route')
    expect(response.status).toBe(404)
    expect(response.body).toHaveProperty('message')
  })

  it('returns 400 when username is null', async () => {
    const response = await postUser({
      username: null,
      email: 'user1@mail.com',
      password: 'Password',
    })

    expect(response.status).toBe(400)
  })

  it('returns validationErrors field in response body when validation Error occurs', async () => {
    const response = await postUser({
      ...validUser,
      email: null,
    })

    expect(response.body.validationErrors).not.toBeUndefined()
    expect(Object.keys(response.body.validationErrors)).toEqual(['email'])
  })

  it('returns errors for both when username and email is null', async () => {
    const response = await postUser({
      ...validUser,
      username: null,
      email: null,
    })

    const { validationErrors } = response.body
    expect(Object.keys(validationErrors)).toEqual(['username', 'email'])
  })

  it('returns errors for all when username, password and email is null', async () => {
    const response = await postUser({
      username: null,
      email: null,
      password: null,
    })

    const { validationErrors } = response.body
    expect(Object.keys(validationErrors)).toEqual(['username', 'email', 'password'])
  })

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
      }
      user[field] = value
      const response = await postUser(user, lang)
      expect(response.body.validationErrors[field]).toBe(expectedMessage)
    }
  )

  it.each`
    field      | lang    | value              | expectedMessage
    ${'email'} | ${'en'} | ${validUser.email} | ${'E-mail already exists'}
    ${'email'} | ${'hi'} | ${validUser.email} | ${'ईमेल पहले से मौजूद है'}
  `('returns $expectedMessage when $field already exists', async ({ field, expectedMessage, value, lang }) => {
    await User.create({ ...validUser })
    const user = {
      username: 'user1',
      email: 'user1@mail.com',
      password: 'password1',
    }
    user[field] = value

    const response = await postUser(user, lang)
    expect(response.body.validationErrors[field]).toBe(expectedMessage)
  })

  it('returns errors for both E-mail already exists and username is null', async () => {
    await User.create({ ...validUser })
    const response = await postUser({
      ...validUser,
      username: null,
    })
    expect(response.body.validationErrors.username).toBe('Username cannot be null')
    expect(response.body.validationErrors.email).toEqual('E-mail already exists')
  })

  /* ------------------------------------------------------------------------ */

  it('hashes the password then storing email, username and hashed password to database', async () => {
    await postUser()
    const savedUser = await User.findOne({ where: { email: validUser.email } })
    expect(savedUser.email).toBe(validUser.email)
    expect(savedUser.username).toBe(validUser.username)
    expect(savedUser.password).not.toBe(validUser.password)
  })

  it('saves the user to database', async () => {
    await postUser()
    const userList = await User.findAll()
    expect(userList.length).toBe(1)
  })

  it('returns 201 when new user created successfully', async () => {
    const response = await postUser()
    expect(response.status).toBe(201)
  })

  it.each(['english', 'hindi'])('returns success to true in %s when new user created successfully', async (lang) => {
    const language = lang === 'hindi' ? 'hi' : 'en'
    const response = await postUser(validUser, language)
    expect(response.body.success).toBeTruthy()
  })

  /* ----------------------------------------------------------------------- */

  it.each([
    ['english', `An account activation link is sent to ${validUser.email}`],
    ['hindi', `एक खाता सक्रियण लिंक ईमेल ${validUser.email} पर भेजा गया है`],
  ])(
    'sends a message with account_activation_link in %s when new user created successfully',
    async (lang, expectedMessage) => {
      const language = lang === 'hindi' ? 'hi' : 'en'
      const response = await postUser(validUser, language)
      expect(response.body.message).toBe(expectedMessage)
    }
  )
})
