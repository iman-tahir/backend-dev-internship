const express = require('express');
const config = require('./config/config');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
app.use(express.json());

app.get('/', (req, res) => res.json({ message: 'Inventory API is running' }));

app.use('/api/suppliers', require('./routes/supplierRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));

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