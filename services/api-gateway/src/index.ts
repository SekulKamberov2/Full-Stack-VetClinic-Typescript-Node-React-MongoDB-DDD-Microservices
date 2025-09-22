import 'dotenv/config';
import express from 'express';
import router from './infrastructure/http/routes';
import cors from 'cors';
import path from 'path';

console.log('----- ENVIRONMENT DEBUG INFO ---');
console.log('Current working directory:', process.cwd());
console.log('__dirname:', __dirname);
console.log('Resolved .env path:', path.resolve(__dirname, '../.env'));
console.log('File exists:', require('fs').existsSync(path.resolve(__dirname, '../.env')));

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

console.log('--- LOADED ENVIRONMENT VARIABLES ---');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '***' : 'UNDEFINED');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('AUTH_SERVICE_URL:', process.env.AUTH_SERVICE_URL);
console.log('PORT:', process.env.PORT);
console.log('All JWT-related env vars:', Object.keys(process.env).filter(key => key.includes('JWT')));

const app = express();

app.use(cors({
  origin: 'http://localhost:3007',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));

app.use(express.json());

app.use((req, _res, next) => {
  console.log('--- INCOMING REQUEST ---');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('-------------------------');
  next();
});

app.use('/', router);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API Gateway running on port ${port}`));
