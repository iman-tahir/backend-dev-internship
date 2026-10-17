require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5002,
  appName: process.env.APP_NAME || 'JWTLoginSystem',
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
};