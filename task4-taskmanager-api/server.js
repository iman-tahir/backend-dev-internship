const express = require('express');
const config = require('./config/config');
const logger = require('./middleware/logger');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(express.json());
app.use(logger);

app.get('/', (req, res) => res.json({ success: true, message: `${config.appName} is running` }));
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`${config.appName} running on http://localhost:${config.port} [${config.nodeEnv}]`);
});