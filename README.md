# Library Management System

A comprehensive library management system with role-based access control, automated fine calculation, and review functionality built with modern web technologies.

## Table of Contents
- [Problem Statement](#problem-statement)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Backend Architecture](#backend-architecture)
- [API Documentation](#api-documentation)
- [Setup & Installation](#setup--installation)
- [Environment Configuration](#environment-configuration)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Authentication & Authorization](#authentication--authorization)
- [Deployment](#deployment)

## Problem Statement

A minimal library management system with role-based access for admins and students, featuring book management, borrowing system with automated fines, and review functionality.

## Features

### Roles
- **Admin** - Full system control and management
- **Student** - Book browsing, borrowing, and reviews

### Functionality

#### Admin Features
- **Authentication and Authorization**
  - Secure JWT-based login system
  - Role-based access control
- **CRUD Operations**
  - Categories management (create, read, update, delete)
  - Books management with ISBN validation
  - Admin account management
- **System Configuration**
  - Configure fine rates (daily fines and lost book penalties)
  - Set borrowing duration limits
- **Monitoring & Management**
  - View all active borrowings and overdue books
  - Manage book return process
  - Track system statistics

#### Student Features
- **Authentication & Registration**
  - Secure account creation and verification
  - JWT-based session management
- **Book Discovery**
  - Browse books by category with pagination
  - Advanced search (by title, author, ISBN)
  - Filter and sort by ratings, date, etc.
- **Borrowing System**
  - Individual borrowing (single student)
  - Group borrowing with email validation
  - View borrowing history and active loans
  - Enhanced return process with damage assessment
  - Report lost books with automatic fine calculation
- **Review System**
  - Submit comprehensive reviews (title, content, rating 1-5)
  - Optional image upload support
  - View and manage personal reviews
- **Financial Management**
  - View current fines and payment status
  - Automatic fine calculations

#### Borrowing Rules
- **Standard Borrow**: 14 days default (configurable)
- **Group Borrow**: Same duration, multiple students
- **Overdue Fine**: Configurable daily charge (default: ₹50/day)
- **Lost Book Policy**: After 30 days overdue
  - Charge: 200% of book price + accumulated fines
  - Book removed from available inventory
- **Damage Assessment**: Books assessed for damage on return
  - No Damage: No additional charges
  - Small Damage: 10% of book price (configurable)
  - Large Damage: 50% of book price (configurable)
- **Lost Book Reporting**: Students can report books as lost before returning
- **Borrowing Limit**: 1 book maximum per active transaction
- **Review Eligibility**: Only students who have borrowed the book can review

## Tech Stack

### Frontend
- **React** - UI library
- **Zustand** - State management
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Hosting** - GitHub Pages

### Backend
- **Node.js + Express** - Server framework
- **TypeScript** - Type safety
- **PostgreSQL** - Database (hosted on Neon)
- **Prisma** - ORM and database toolkit
- **JWT + bcrypt** - Authentication & password hashing
- **Swagger** - API documentation
- **Cloudinary** - File upload and image management
- **Hosting** - Railway

## Backend Architecture

### Project Structure
```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.ts  # Prisma client setup
│   │   └── swagger.ts   # Swagger documentation config
│   ├── controllers/     # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── books.controller.ts
│   │   ├── categories.controller.ts
│   │   └── student-books.controller.ts
│   ├── middlewares/     # Custom middleware
│   │   ├── auth.middleware.ts
│   │   └── errorHandler.middleware.ts
│   ├── routes/          # API route definitions
│   │   ├── auth.routes.ts
│   │   ├── books.router.ts
│   │   ├── categories.router.ts
│   │   ├── student-books.router.ts
│   │   └── index.routes.ts
│   ├── utils/           # Utility functions
│   │   ├── response.ts  # Standardized API responses
│   │   └── error.ts     # Error handling utilities
│   ├── types/           # TypeScript type definitions
│   └── server.ts        # Application entry point
├── prisma/
│   └── schema.prisma    # Database schema
├── seed.ts              # Database seeding script
└── package.json
```

### Key Components

#### Authentication System
- **JWT Token-based** authentication
- **Role-based authorization** (Admin/Student)
- **Password hashing** with bcrypt
- **Token expiration** handling (7 days default)

#### Database Layer
- **Prisma ORM** with type-safe queries
- **PostgreSQL** database with proper indexing
- **Transaction support** for atomic operations
- **Soft deletion** for data integrity

#### Security Features
- **Helmet.js** for security headers
- **CORS** configuration
- **Input validation** and sanitization
- **SQL injection** protection via Prisma
- **Rate limiting** ready implementation

## API Documentation

### Interactive Documentation
- **Swagger UI**: Available at `/api-docs`
- **OpenAPI 3.0** specification
- **Live testing** interface
- **Authentication** integrated (Bearer token)

### Base URL
- **Development**: `http://localhost:5000/api/v1`
- **Production**: `https://your-railway-app.railway.app/api/v1`

## Setup & Installation

### Prerequisites
- **Node.js** (v18+)
- **pnpm** (recommended) or npm
- **PostgreSQL** database
- **Git**

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd library-management-system/backend
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Database setup**
   ```bash
   # Generate Prisma client
   pnpm prisma:generate
   
   # Run migrations
   pnpm prisma:migrate
   
   # Seed initial data
   npx tsx seed.ts
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```

## Environment Configuration

### Required Environment Variables

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"

# Server Configuration
PORT=5000
NODE_ENV=development

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# File Upload (Optional)
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Development vs Production
- **Development**: Uses local PostgreSQL or development database
- **Production**: Uses Neon PostgreSQL with SSL requirements

## Database Schema

### Core Models
- **User** - Student and Admin accounts
- **Category** - Book categorization
- **Book** - Library inventory
- **Borrowing** - Loan transactions
- **BorrowedBook** - Book-specific borrowing details with damage tracking
- **BorrowingStudent** - Student-borrowing relationships
- **Review** - Book reviews and ratings with image support
- **FineConfig** - System configuration for fines and damage penalties

### Key Enums
- **UserRole** - ADMIN, STUDENT
- **BorrowType** - INDIVIDUAL, GROUP
- **BorrowingStatus** - ACTIVE, RETURNED, OVERDUE, LOST
- **DamageLevel** - NONE, SMALL, LARGE

### Key Relationships
- One-to-Many: Category → Books
- Many-to-Many: Students ↔ Borrowings (via BorrowingStudent)
- One-to-Many: Borrowing → BorrowedBooks
- One-to-One: Book + Student → Review (unique constraint)

## API Endpoints

### Authentication (`/api/v1/auth`)
- `POST /login` - User authentication
- `POST /register` - Student registration
- `POST /verify` - Email verification
- `POST /forgot-password` - Password reset
- `POST /reset-password` - Password reset confirmation

### Admin - Categories (`/api/v1/categories`) Admin Only
- `GET /` - List all categories
- `GET /:id` - Get category details
- `POST /` - Create new category
- `PUT /:id` - Update category
- `DELETE /:id` - Delete category

### Admin - Books (`/api/v1/books`) Admin Only
- `GET /` - List books (pagination, search, filter)
- `GET /:id` - Get book details
- `POST /` - Create new book
- `PUT /:id` - Update book
- `DELETE /:id` - Delete/soft delete book
- `PATCH /:id/restore` - Restore soft-deleted book

### Student - Books (`/api/v1/student`) Student Only
- `GET /books` - Browse available books
- `GET /books/:id` - Get book details with reviews
- `GET /categories` - Get categories picklist
- `POST /borrow` - Borrow book (individual/group)
- `GET /my-borrowings` - Get borrowing history
- `PATCH /return/:borrowingId` - Return borrowed book with damage assessment
- `PATCH /report-lost/:borrowingId` - Report borrowed book as lost

### Student - Reviews (`/api/v1/student`) Student Only
- `POST /reviews` - Create book review
- `GET /reviews` - Get user's reviews
- `PUT /reviews/:id` - Update review
- `DELETE /reviews/:id` - Delete review

## Authentication & Authorization

### JWT Token Structure
```json
{
  "userId": "user-uuid",
  "role": "STUDENT|ADMIN",
  "email": "user@example.com",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Authorization Levels
- **Public**: Registration, login
- **Student**: Book browsing, borrowing, reviews
- **Admin**: Full system access, management features

### Security Middleware
- **authenticateJWT**: Validates JWT tokens
- **authorizeRoles**: Checks user permissions
- **errorHandler**: Global error handling

## Development Commands

```bash
# Development
pnpm dev              # Start development server with hot reload
pnpm build            # Build for production
pnpm start            # Start production server

# Database
pnpm prisma:generate  # Generate Prisma client
pnpm prisma:migrate   # Run database migrations
pnpm prisma:studio    # Open Prisma Studio (database GUI)

# Code Quality
pnpm lint             # Run ESLint
pnpm format           # Format code with Prettier

# Testing
pnpm test             # Run tests (when implemented)
```

## Deployment

### Railway Deployment
1. **Connect Repository**: Link GitHub repository to Railway
2. **Environment Variables**: Set all required environment variables
3. **Database**: Use Neon PostgreSQL addon or external database
4. **Build Command**: `pnpm build`
5. **Start Command**: `pnpm start`

### Manual Deployment
1. **Build the application**
   ```bash
   pnpm build
   ```

2. **Set production environment variables**

3. **Run migrations**
   ```bash
   pnpm prisma:migrate
   ```

4. **Start the server**
   ```bash
   pnpm start
   ```

## Features Implemented

### Admin Features
- [x] Complete CRUD for books and categories
- [x] Role-based access control
- [x] Comprehensive search and filtering
- [x] Soft delete with restore functionality
- [x] Stock management and validation

### Student Features
- [x] Book browsing with pagination
- [x] Advanced search (title, author, ISBN)
- [x] Individual and group borrowing
- [x] Automatic borrowing validation
- [x] Enhanced return process with damage assessment
- [x] Lost book reporting functionality
- [x] Fine calculation system with damage penalties
- [x] Review system with ratings and image upload
- [x] Borrowing history tracking

### System Features
- [x] JWT authentication system
- [x] Comprehensive error handling
- [x] API documentation with Swagger
- [x] Database seeding scripts
- [x] Type-safe development with TypeScript
- [x] Standardized API responses
- [x] Transaction-safe operations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.

---

**API Documentation**: Visit `/api-docs` when the server is running for interactive API documentation.

**Support**: For issues and questions, please use the GitHub issue tracker.
