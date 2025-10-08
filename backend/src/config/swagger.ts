import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJSDoc.Options = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'Library Management System API',
			version: '1.0.0',
			description:
				'A comprehensive library management system with user authentication, book management, and borrowing functionality.',
			contact: {
				name: 'Library Management System',
				email: 'admin@library.com',
			},
		},
		servers: [
			{
				url: 'http://localhost:5000',
				description: 'Development server',
			},
		],
		components: {
			securitySchemes: {
				bearerAuth: {
					type: 'http',
					scheme: 'bearer',
					bearerFormat: 'JWT',
					description: 'Enter JWT token obtained from login',
				},
			},
		},
		security: [
			{
				bearerAuth: [],
			},
		],
	},
	apis: [
		'./src/controllers/*.ts',
		'./src/routes/*.ts',
		'./src/middlewares/*.ts',
	],
};

const specs = swaggerJSDoc(options);

export const setupSwagger = (app: Express): void => {
	// Swagger UI options with token retention
	const swaggerUiOptions = {
		explorer: true,
		swaggerOptions: {
			persistAuthorization: true, // This enables token retention
			filter: true,
			displayRequestDuration: true,
		},
		customCss: `
			.swagger-ui .topbar { display: none }
			.swagger-ui .info { margin: 20px 0 }
		`,
		customSiteTitle: 'Library Management API Documentation',
	};

	app.use('/api-docs', swaggerUi.serve);
	app.get('/api-docs', swaggerUi.setup(specs, swaggerUiOptions));

	// Serve the raw swagger.json
	app.get('/api-docs.json', (_req, res) => {
		res.setHeader('Content-Type', 'application/json');
		res.send(specs);
	});
};

export default specs;
