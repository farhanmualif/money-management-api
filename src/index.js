import express from 'express';
import { connectDB } from './config/db.js';
import dotenv from 'dotenv';
import router from './routes/route.js';
import {
  errorHandler,
  notFoundHandler,
} from './middlewares/error-hadler.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
connectDB();

app.use('/api', router);

app.use(errorHandler);
app.use(notFoundHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
