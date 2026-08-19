# 📚 Smart Library Management System

A full-stack, state-of-the-art **Smart Library Management System** built with **React, Node.js, Express, and MongoDB (Mongoose)**. Designed with sleek glassmorphism UI aesthetics, real-time stock availability, role-based dashboards, automatic late fine calculations, reservation queues, in-app notifications, and Recharts analytics with CSV/PDF export support.

---

## 🌟 Key Features & User Roles

### 👑 1. Admin Role
- **System-Wide Analytics Dashboard**: Real-time stats for total books, active loans, overdue items, total fines collected, and category breakdown.
- **Analytics Charts**: Recharts monthly borrowing velocity AreaChart and category share PieChart.
- **User Account Management**: Create, view, activate/deactivate, or delete Librarian and Member accounts.
- **Library Policy Control**: Configurable overdue daily fine rate ($/day), maximum loan days, maximum books allowed per member, and fine block thresholds.
- **Report Exports**: One-click exports of inventory and loan transactions as **CSV** or **PDF**.

### 📚 2. Librarian Role
- **Book Inventory Management (CRUD)**: Add, edit, delete books with cover images, ISBN codes, shelf location codes, and stock count tracking.
- **Category & Genre Control**: Create custom genres with badge theme color highlights.
- **Circulation Desk**: Issue books to members and process returns.
- **Automated Late Fine Calculation**: Automatically calculates late fees when overdue books are returned based on system policy.
- **Reservation Queue**: Approve and notify next members in line when reserved books become available.

### 🎓 3. Member Role (Student / Reader)
- **Interactive Catalog**: Search by Title, Author, ISBN, or Publisher; filter by availability or genre; sort by newest or title.
- **Real-Time Availability**: Check shelf location and instant stock status.
- **Reservation System**: Place reservation queues for out-of-stock books with automated availability alerts.
- **Member Dashboard**: View active borrowed books, countdown to return due date, borrowing history timeline, and unpaid fine simulator.
- **In-App Notifications**: Real-time alert drawer for due date reminders, overdue warnings, and reservation ready alerts.

---

## 🛠 Tech Stack

- **Frontend**: React.js (Vite), Tailwind CSS, Lucide Icons, Recharts, Axios, React Router v6.
- **Backend**: Node.js, Express.js, JWT Authentication (RBAC), bcryptjs, Multer, json2csv, PDFKit.
- **Database**: MongoDB with Mongoose ODM (includes seamless zero-setup `mongodb-memory-server` fallback!).

---

## 🔑 Quick Demo Login Credentials

You can use the **1-Click Quick Demo Sign-In buttons** on the Login Page or use these credentials:

| Role | Email | Password | Access Rights |
|---|---|---|---|
| 👑 **Admin** | `admin@library.com` | `admin123` | Full access, user management, policy settings, analytics & exports |
| 📚 **Librarian** | `librarian@library.com` | `librarian123` | Book CRUD, Issue/Return desk, categories, reservation approvals |
| 🎓 **Student 1** | `student1@library.com` | `student123` | Browse catalog, active loans, reserve books, pay fines |
| 🎓 **Student 2** | `student2@library.com` | `student123` | Overdue loan sample with assessed fine balance |

---

## 🚀 Setup & Execution Instructions

### Prerequisites
- Node.js (v18+) and npm installed on your system.

### 1. Install Dependencies
Run the following root script to install dependencies for both `server` and `client`:
```bash
npm run install:all
```

### 2. Seed Database
Populate 15+ sample books, categories, users, active loans, and settings:
```bash
npm run seed
```

### 3. Run Development Servers
Start both backend (Port 5000) and React frontend (Port 5173) concurrently:
```bash
npm run dev
```

Open your browser and navigate to: **`http://localhost:5173`**

---

## 📡 API Endpoints Overview

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new student member |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT token |
| `GET` | `/api/auth/me` | Private | Get logged-in user details & stats |
| `GET` | `/api/books` | Public | Search, filter, and paginate book catalog |
| `POST` | `/api/books` | Staff | Add new book to catalog |
| `PUT` | `/api/books/:id` | Staff | Update book record |
| `DELETE` | `/api/books/:id` | Staff | Delete book record |
| `POST` | `/api/transactions/issue` | Staff | Issue book to a member |
| `POST` | `/api/transactions/return` | Staff | Return book & calculate late fine |
| `POST` | `/api/transactions/pay-fine/:id` | Member | Pay fine balance |
| `POST` | `/api/reservations` | Member | Reserve an out-of-stock book |
| `GET` | `/api/reports/dashboard` | Admin | Fetch analytics & chart data |
| `GET` | `/api/reports/export/csv` | Admin | Download inventory/transaction CSV |
| `GET` | `/api/reports/export/pdf` | Admin | Download inventory PDF report |

---

## 📂 Project Structure

```
Smart Library Management System/
├── client/                     # React Vite Frontend Application
│   ├── public/
│   ├── src/
│   │   ├── components/         # Navbar, BookCard, StatCard, Modal, Pagination, NotificationDrawer
│   │   ├── context/            # AuthContext, NotificationContext
│   │   ├── pages/              # CatalogPage, BookDetailsPage, LoginPage, RegisterPage, AdminDashboard, LibrarianDashboard, MemberDashboard, ProfilePage
│   │   ├── App.jsx             # React router & protected routes
│   │   ├── index.css           # Tailwind CSS glassmorphism theme
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── server/                     # Node.js Express REST Backend API
│   ├── config/                 # Database configuration & MongoMemoryServer fallback
│   ├── controllers/            # Auth, Book, Transaction, Reservation, Category, Notification, User, Report, Setting
│   ├── middleware/             # JWT Auth, RBAC, Multer upload, Error handler
│   ├── models/                 # User, Book, Transaction, Reservation, Category, Notification, Setting Mongoose schemas
│   ├── routes/                 # Express API routes
│   ├── seed.js                 # Seed script with 15+ books & demo accounts
│   ├── server.js               # Express application entry point
│   ├── test_api.js             # Automated API test suite
│   └── package.json
├── .env                        # Configuration file
├── .env.example
├── package.json                # Workspace orchestration scripts
├── postman_collection.json     # Ready-to-import Postman REST collection
└── README.md
```
