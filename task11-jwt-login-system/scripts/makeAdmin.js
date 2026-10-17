
require('dotenv').config();

const mongoose = require('mongoose');
const config = require('../config/config');
const User = require('../models/User');

const makeAdmin = async () => {
  try {
    if (!config.mongoUri) {
      throw new Error('MONGO_URI is missing from your .env file');
    }

    await mongoose.connect(config.mongoUri);

    const email = process.argv[2];

    if (!email) {
      throw new Error(
        'Please provide an email: npm run make-admin -- admin@test.com'
      );
    }

    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { $set: { role: 'admin' } },
      { new: true, runValidators: true }
    );

    if (!user) {
      console.error(`No user found with email: ${email}`);
      process.exitCode = 1;
      return;
    }

    console.log(`Success! ${user.email} is now an admin.`);
  } catch (error) {
    console.error('Failed to make admin:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

makeAdmin();
