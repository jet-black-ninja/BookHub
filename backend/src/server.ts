import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middlewares/errorHandler.middleware';
import { sendResponse } from './utils/response';

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

// Example route
app.get('/', (req, res) => {
  sendResponse(res, {
    success: true,
    message: 'API is running',
  });
});

// ...other routes

// Error handler (should be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

