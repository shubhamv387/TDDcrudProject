const app = require('./src/app')
const sequelize = require('./src/utils/db')
const PORT = process.env.PORT || 3000

sequelize
  // .sync()
  .sync({ force: true })
  .then(() => app.listen(3000, () => console.log(`Server is running at http://localhost:${PORT}`)))
