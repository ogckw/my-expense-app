import mongoose from 'mongoose';
import config from './config.js';
import fastify from './app.js';

const start = async () => {
  try {
    await mongoose.connect(config.mongodbUri, { useNewUrlParser: true, useUnifiedTopology: true });
    await fastify.listen(3000);
    fastify.log.info(`Server is running on port 3000`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
