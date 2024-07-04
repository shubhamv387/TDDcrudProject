const app = require('./src/app');
const sequelize = require('./src/config/db');
const PORT = process.env.PORT || 3000;

sequelize.sync().then(() => app.listen(3000, () => console.log(`Server is running at http://localhost:${PORT}`)));
