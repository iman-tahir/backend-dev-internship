const express = require('express');
const config = require('./config/config');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

if (!config.jwtSecret) {
  console.error('JWT_SECRET is missing in .env');
  process.exit(1);
}

const app = express();
app.use(express.json());

// Public (unprotected) routes
app.get('/', (req, res) => res.json({ message: `${config.appName} is running` }));
app.get('/api/public', (req, res) => res.json({ message: 'This is a public route. Anyone can see it.' }));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

app.use(notFound);
app.use(errorHandler);

connectDB()
  .then(() => {
    app.listen(config.port, () =>
      console.log(`Server running on port ${config.port} (${config.nodeEnv})`)
    );
  })
  .catch((err) => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  });
