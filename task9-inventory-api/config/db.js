const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const config = require('./config');

const connectDB = async () => {
  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 15000 });
  console.log(`MongoDB connected: ${mongoose.connection.name}`);
};

module.exports = connectDB;