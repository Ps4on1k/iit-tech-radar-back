require('dotenv').config();

const { AppDataSource } = require('./dist/database');

console.log('=== DB Config ===');
console.log('Host:', process.env.DB_HOST);
console.log('Port:', process.env.DB_PORT);
console.log('Username:', process.env.DB_USERNAME);
console.log('Password:', process.env.DB_PASSWORD ? '***' : 'EMPTY');
console.log('Database:', process.env.DB_NAME);
console.log('================');

AppDataSource.initialize()
  .then(() => {
    console.log('✓ БД подключена');
    return AppDataSource.destroy();
  })
  .then(() => {
    console.log('✓ БД отключена');
    process.exit(0);
  })
  .catch(err => {
    console.error('✗ Ошибка БД:', err.message);
    console.error('Stack:', err.stack);
    process.exit(1);
  });
