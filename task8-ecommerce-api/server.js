const express = require('express');
const config = require('./config/config');
const connectDB = require('./config/db');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: `${config.appName} is running` });
});

app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);

// 404 for any route that didn't match
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Must be registered LAST
app.use(errorHandler);

const startServer = async () => {
  await connectDB();
  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port} (${config.nodeEnv})`);
  });
};

startServer();