require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5001,
  appName: process.env.APP_NAME || 'InventoryAPI',
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/inventorydb',
};