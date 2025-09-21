import express from 'express';
import router from './infrastructure/http/routes';

const app = express();
app.use(express.json());
app.use('/', router);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API Gateway running on port ${port}`));
