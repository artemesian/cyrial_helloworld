export default () => ({
  port: parseInt(process.env.PORT, 10) || 4000,
  database: process.env.DB_NAME,
  username: process.env.USER_NAME,
  password: process.env.USER_NAME,
  host: process.env.DB_HOST,
});
