import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middlewares/errorHandler.middleware';
import { sendResponse } from './utils/response';
import { setupSwagger } from './config/swagger';
import 'dotenv/config';
import routes from './routes/index.routes';

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

// Setup Swagger documentation
setupSwagger(app);

// API routes
app.use('/api/v1', routes);

// Example route
app.get('/', (_req, res) => {
	sendResponse(res, {
		success: true,
		message: 'Library Management System API is running',
		data: {
			version: '1.0.0',
			documentation: '/api-docs',
		},
	});
});

// Error handler (should be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
	console.log(
		`API Documentation available at: http://localhost:${PORT}/api-docs`
	);
});
