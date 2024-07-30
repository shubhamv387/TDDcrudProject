const sequelize = require('./src/utils/db')

let originalConsoleLog

beforeAll(() => {
  return sequelize.sync()
})

beforeAll(async () => {
  originalConsoleLog = console.log
  console.log = jest.fn()
})

afterAll(async () => {
  console.log = originalConsoleLog
})
