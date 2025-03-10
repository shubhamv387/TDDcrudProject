const Sequelize = require('sequelize')
const config = require('config')

const dbConfig = config.get('database')

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  dialect: dbConfig.dialect,
  host: 'localhost',
  logging: dbConfig.logging,
})

module.exports = sequelize
