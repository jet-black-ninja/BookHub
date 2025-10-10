# Library Management System (Frontend)

## Overview
This is a React + Vite frontend for a Library Management System with **Admin** and **Student** roles.

- **Admin**: Manage books, borrowings, users, fines.
- **Student**: Browse books, borrow books, return books with damage assessment, view fines, submit reviews.

## Table of Contents

- [Library Management System (Frontend)](#library-management-system-frontend)
  - [Overview](#overview)
  - [Table of Contents](#table-of-contents)
  - [Project Overview](#project-overview)
  - [Technologies Used](#technologies-used)
  - [Folder Structure](#folder-structure)
  - [Pages \& Components](#pages--components)
    - [Student Pages](#student-pages)
    - [Admin Pages](#admin-pages)
    - [Key Components](#key-components)
  - [New Features](#new-features)
    - [Enhanced Return Process](#enhanced-return-process)
    - [Damage Levels](#damage-levels)
  - [Running the Project](#running-the-project)
    - [Install dependencies:](#install-dependencies)
    - [Start development server:](#start-development-server)
  - [State Management](#state-management)

## Project Overview

This frontend allows:

- Admins to manage books, users, and borrowings.
- Students to browse books, request borrowings, return books with damage assessment, and view fines.
- Borrowing workflow: Student requests → Admin approves → Borrowing tracked with fines → Enhanced return process with damage evaluation.

## Technologies Used

- **Frontend**: React, TypeScript, Tailwind CSS, ShadCN
- **Routing**: React Router v6
- **Notifications**: react-hot-toast
- **Forms & Validation**: React Hook Form + Zod

## Folder Structure

```
frontend/
├─ src/
│  ├─ pages/
│  │  ├─ admin/
│  │  │  ├─ AdminDashboardPage.tsx
│  │  │  └─ AdminBooksPage.tsx
│  │  └─ students/
│  │     ├─ DashboardPage.tsx
│  │     ├─ BooksPage.tsx
│  │     ├─ FinesPage.tsx
│  │     ├─ ReviewPage.tsx
│  │     └─ BorrowingsPage.tsx
│  ├─ components/
│  │  ├─ Sidebar.tsx
│  │  ├─ Layout.tsx
│  │  ├─ ReturnBookModal.tsx      # New: Enhanced return process
│  │  ├─ RoleBasedRedirect.tsx
│  │  ├─ PublicRoute.tsx
│  │  ├─ ProtectedRoute.tsx
│  │  └─ AdminRoute.tsx
│  ├─ schemas/
│  │  └─ library.ts               # TypeScript interfaces for Borrowing, Book, User
│  └─ App.tsx
```

## Pages & Components

### Student Pages
- **Dashboard** (`/dashboard`) - Overview of borrowings and quick actions
- **Browse Books** (`/books`) - Search and browse available books
- **My Borrowings** (`/my-borrowings`) - View active and past borrowings with return functionality
- **My Fines** (`/my-fines`) - View outstanding fines and payment history
- **Review** (`/review`) - Submit reviews for borrowed books with image upload

### Admin Pages
- **Dashboard** (`/admin/dashboard`) - System overview and statistics
- **Manage Books** (`/admin/books`) - CRUD operations for books and categories

### Key Components
- **ReturnBookModal**: Enhanced return process with damage assessment
  - Damage level selection (None, Small, Large)
  - Damage notes and descriptions
  - Fine calculation preview
  - Lost book reporting integration

## New Features

### Enhanced Return Process
- **Damage Assessment**: Students can assess book condition on return
- **Fine Calculation**: Automatic calculation based on damage level
- **Lost Book Reporting**: Option to report books as lost
- **Visual Feedback**: Clear breakdown of fines and charges

### Damage Levels
- **None**: No additional charges
- **Small**: 10% of book price fine
- **Large**: 50% of book price fine
- **Lost**: 200% of book price + overdue fines

## Running the Project

### Install dependencies: 

```bash
pnpm install
```

### Start development server:

```bash
pnpm run dev
```

## State Management

The application uses React Context for authentication state and local state management for component-specific data.