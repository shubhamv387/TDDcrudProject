const mockConsoleLog = () => {
  let originalConsoleLog

  beforeAll(() => {
    originalConsoleLog = console.log
    console.log = jest.fn()
  })

  afterAll(() => {
    console.log = originalConsoleLog
  })
}

const mockNodemailer = {
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockImplementation((mailOptions, callback) => {
      callback(null, { messageId: '123', response: '250 OK' })
    }),
  }),

  getTestMessageUrl: jest.fn().mockReturnValue('http://test.message.url'),
}

module.exports = {
  mockConsoleLog,
  mockNodemailer,
}
