# Library Management System (Frontend)

## Overview
This is a React + Vite frontend for a Library Management System with **Admin** and **Student** roles.

- **Admin**: Manage books, borrowings, users, fines.
- **Student**: Browse books, borrow books, view fines, submit reviews.

Table of Contents

Project Overview

Technologies Used

Folder Structure

Pages & Components

State Management

Running the Project

## Project Overview

This frontend allows:

Admins to manage books, users, and borrowings.

Students to browse books, request borrowings, and view fines.

Borrowing workflow: Student requests → Admin approves → Borrowing tracked with fines.



## Technologies Used

Frontend: React, TypeScript, Tailwind CSS

Routing: React Router v6

Notifications: react-hot-toast

Forms & Validation: React Hook Form + Zod (optional)

## Folder Structure

```
client/
├─ src/
│  ├─ pages/
│  │  ├─ admin/
│  │  │  ├─ AdminDashboardPage.tsx
│  │  │  ├─ AdminUsersPage.tsx
│  │  │  ├─ AdminBooksPage.tsx
│  │  │  └─ AdminBorrowingsPage.tsx
│  │  └─ student/
│  │     ├─ StudentDashboardPage.tsx
│  │     └─ BrowseBooksPage.tsx
│  ├─ components/
│  │  ├─ Sidebar.tsx
│  │  └─ Table.tsx
│  ├─ schemas/
│  │  └─ library.ts         # TypeScript interfaces for Borrowing, Book, User
│  └─ App.tsx
```

## Running the Project

### Install dependencies: 

```
pnpm install
```
```
pnpm run dev
```

## Pages

### Student Pages
- Dashboard (`/dashboard`)
- Browse Books (`/books`)
- My Borrowings (`/my-borrowings`)
- My Fines (`/my-fines`)
- Review (`/review`)

### Admin Pages
- Dashboard (`/admin/dashboard`)
- Manage Books (`/admin/books`)
- All Borrowings (`/admin/borrowings`)
- Manage Users (`/admin/users`)