# Library management system

1. Problem Statement

A minimal library management system with role-based access for admins and students, featuring book management, borrowing system with automated fines, and review functionality.

2. Features
### Roles
- Admin - full system control
- Student - Book browsing,  borrowing and reviews.
### functionality
- Admin Features
    - Authentication and authorization
    - CRUD operations for
        - Categories
        - Books
        - Admin accounts
    - Configure fine rates (per day and lost book penalty)
    - View all active borrowings and overdue books
    - Manage book return process
- Student Features
    - Authentication and registration
    - Browse books by category
    - Search books (by title, author, ISBN)
    - Request up to 3 books per transaction
    - View borrowing history and active loans
    - Submit reviews (title, content, optional image)
    - View current fines and payment status
- Borrowing Rules
    - Standard Borrow: 1 month (30 days) for individual requests
    - Group Borrow: Extended duration for multiple books (define: 2-3 months)
    - Overdue Fine: Configurable daily charge (default: ₹5/day)
    - Lost Book: After 30 days overdue, book marked as lost
        - Charge: 200% of book price + accumulated fines
    - Borrowing Limit: 1 books maximum per active transaction
    - Review Eligibility: Only students who have borrowed the book can review
### Tech Stack
- Front-End
    - React
    - Zustand
    - React Router
    - Tailwind
    - Hosting - Github Pages
- Back-End
    - Node + Express
    - Postgres on Neon
    - Prisma
    - Auth - JWT + bcrypt
    - Cloudinary For File Upload
    - Zod for validation
    - Hosting on Railway