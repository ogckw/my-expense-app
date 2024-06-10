import path from 'path';
import { fileURLToPath } from 'url';
import Fastify from 'fastify';
import expenseRoutes from './routes/expenseRoutes.js';
import fastifyStatic from '@fastify/static';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastify = Fastify({ logger: true });

// 設置靜態文件服務
fastify.register(fastifyStatic, {
  root: path.join(__dirname, '../public'),
  prefix: '/', // optional: default '/'
});

// 載入路由
expenseRoutes.forEach((route) => {
  fastify.route(route);
});

export default fastify;
