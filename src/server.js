// src/server.js
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import routes from './index.js';
import errorHandler from './Middlewares/error.middleware.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Hotel POS Backend API' });
});

app.use('/api', routes);

app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
