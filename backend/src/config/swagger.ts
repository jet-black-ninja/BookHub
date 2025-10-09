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
				'A comprehensive library management system with user authentication, book management, borrowing functionality, and review system with image uploads.',
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
			schemas: {
				// File upload schema for Swagger UI
				FileUpload: {
					type: 'object',
					properties: {
						coverImage: {
							type: 'string',
							format: 'binary',
							description:
								'Book cover image file (JPG, PNG, GIF, WebP) - Max 5MB',
						},
					},
				},
				// Review schemas
				ReviewRequest: {
					type: 'object',
					required: ['bookId', 'title', 'content', 'rating'],
					properties: {
						bookId: {
							type: 'string',
							description: 'The ID of the book being reviewed',
						},
						title: {
							type: 'string',
							maxLength: 200,
							description: 'Review title',
						},
						content: {
							type: 'string',
							maxLength: 1000,
							description: 'Review content',
						},
						rating: {
							type: 'integer',
							minimum: 1,
							maximum: 5,
							description: 'Rating from 1 to 5',
						},
					},
				},
				ReviewResponse: {
					type: 'object',
					properties: {
						id: {
							type: 'string',
						},
						title: {
							type: 'string',
						},
						content: {
							type: 'string',
						},
						rating: {
							type: 'integer',
						},
						imageUrl: {
							type: 'string',
							nullable: true,
						},
						createdAt: {
							type: 'string',
							format: 'date-time',
						},
						book: {
							type: 'object',
							properties: {
								id: {
									type: 'string',
								},
								title: {
									type: 'string',
								},
								author: {
									type: 'string',
								},
							},
						},
						student: {
							type: 'object',
							properties: {
								id: {
									type: 'string',
								},
								name: {
									type: 'string',
								},
								email: {
									type: 'string',
								},
							},
						},
					},
				},
				// Error response schema
				ErrorResponse: {
					type: 'object',
					properties: {
						success: {
							type: 'boolean',
							example: false,
						},
						message: {
							type: 'string',
							example: 'Error message',
						},
						error: {
							type: 'string',
							example: 'Detailed error information',
						},
					},
				},
				// Success response schema
				SuccessResponse: {
					type: 'object',
					properties: {
						success: {
							type: 'boolean',
							example: true,
						},
						message: {
							type: 'string',
							example: 'Operation completed successfully',
						},
						data: {
							type: 'object',
							description: 'Response data',
						},
					},
				},
			},
			requestBodies: {
				// Request body for creating a book with file upload
				CreateBookWithImage: {
					required: true,
					content: {
						'multipart/form-data': {
							schema: {
								type: 'object',
								required: [
									'title',
									'author',
									'isbn',
									'categoryId',
									'price',
								],
								properties: {
									title: {
										type: 'string',
										description: 'Book title',
										example: 'The Great Gatsby',
									},
									author: {
										type: 'string',
										description: 'Book author',
										example: 'F. Scott Fitzgerald',
									},
									isbn: {
										type: 'string',
										description: 'Book ISBN (unique)',
										example: '978-0-7432-7356-5',
									},
									categoryId: {
										type: 'string',
										description: 'Category ID',
										example: 'cat123',
									},
									description: {
										type: 'string',
										description: 'Book description',
										example: 'A classic American novel',
									},
									price: {
										type: 'number',
										description: 'Book price',
										example: 29.99,
									},
									totalCopies: {
										type: 'integer',
										minimum: 1,
										default: 3,
										description: 'Total number of copies',
										example: 5,
									},
									coverImage: {
										type: 'string',
										format: 'binary',
										description:
											'Book cover image file (JPG, PNG, GIF, WebP) - Max 5MB',
									},
								},
							},
						},
					},
				},
				// Request body for updating a book with file upload
				UpdateBookWithImage: {
					required: false,
					content: {
						'multipart/form-data': {
							schema: {
								type: 'object',
								properties: {
									title: {
										type: 'string',
										description: 'Book title',
										example: 'The Great Gatsby (Updated)',
									},
									author: {
										type: 'string',
										description: 'Book author',
										example: 'F. Scott Fitzgerald',
									},
									isbn: {
										type: 'string',
										description: 'Book ISBN',
										example: '978-0-7432-7356-5',
									},
									categoryId: {
										type: 'string',
										description: 'Category ID',
										example: 'cat123',
									},
									description: {
										type: 'string',
										description: 'Book description',
										example:
											'An updated classic American novel',
									},
									price: {
										type: 'number',
										description: 'Book price',
										example: 34.99,
									},
									totalCopies: {
										type: 'integer',
										minimum: 1,
										description: 'Total number of copies',
										example: 7,
									},
									coverImage: {
										type: 'string',
										format: 'binary',
										description:
											'New book cover image file (JPG, PNG, GIF, WebP) - Max 5MB',
									},
								},
							},
						},
					},
				},
				// Review request bodies
				CreateReviewWithImage: {
					required: true,
					content: {
						'multipart/form-data': {
							schema: {
								type: 'object',
								required: [
									'bookId',
									'title',
									'content',
									'rating',
								],
								properties: {
									bookId: {
										type: 'string',
										description:
											'The ID of the book being reviewed',
										example: 'book123',
									},
									title: {
										type: 'string',
										maxLength: 200,
										description: 'Review title',
										example: 'Amazing Book!',
									},
									content: {
										type: 'string',
										maxLength: 1000,
										description: 'Review content',
										example:
											'This book changed my perspective on literature...',
									},
									rating: {
										type: 'integer',
										minimum: 1,
										maximum: 5,
										description: 'Rating from 1 to 5',
										example: 5,
									},
									image: {
										type: 'string',
										format: 'binary',
										description:
											'Optional review image (max 5MB)',
									},
								},
							},
						},
					},
				},
				UpdateReviewWithImage: {
					required: false,
					content: {
						'multipart/form-data': {
							schema: {
								type: 'object',
								properties: {
									title: {
										type: 'string',
										maxLength: 200,
										description: 'Review title',
										example: 'Updated Review Title',
									},
									content: {
										type: 'string',
										maxLength: 1000,
										description: 'Review content',
										example: 'Updated review content...',
									},
									rating: {
										type: 'integer',
										minimum: 1,
										maximum: 5,
										description: 'Rating from 1 to 5',
										example: 4,
									},
									image: {
										type: 'string',
										format: 'binary',
										description:
											'Optional review image (max 5MB)',
									},
									removeImage: {
										type: 'boolean',
										description:
											'Set to true to remove existing image',
										example: false,
									},
								},
							},
						},
					},
				},
			},
			responses: {
				// Common response schemas
				ValidationError: {
					description: 'Validation Error',
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/ErrorResponse',
							},
							example: {
								success: false,
								message: 'Validation failed',
								error: 'Missing required fields: title, author, isbn, categoryId, price',
							},
						},
					},
				},
				Unauthorized: {
					description: 'Unauthorized - Invalid or missing token',
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/ErrorResponse',
							},
							example: {
								success: false,
								message: 'Access denied. No token provided.',
							},
						},
					},
				},
				Forbidden: {
					description: 'Forbidden - Insufficient permissions',
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/ErrorResponse',
							},
							example: {
								success: false,
								message: 'Access denied. Admin role required.',
							},
						},
					},
				},
				NotFound: {
					description: 'Resource not found',
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/ErrorResponse',
							},
							example: {
								success: false,
								message: 'Resource not found',
							},
						},
					},
				},
				Conflict: {
					description: 'Conflict - Resource already exists',
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/ErrorResponse',
							},
							example: {
								success: false,
								message: 'Book with this ISBN already exists',
							},
						},
					},
				},
				InternalServerError: {
					description: 'Internal Server Error',
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/ErrorResponse',
							},
							example: {
								success: false,
								message: 'Internal server error',
								error: 'An unexpected error occurred',
							},
						},
					},
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
