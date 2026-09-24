# Pharma.com — MERN Stack Application

Welcome to the fully functional **Pharma.com** e-commerce portal, built with a secure, robust Node.js API and a Vite + React client using MongoDB data stores.

---

## 🛠️ Prerequisites

*   **Node.js**: v18.0.0 or higher
*   **npm**: v9.0.0 or higher
*   **MongoDB**: Local running instance (e.g. Community Server) or a remote MongoDB Atlas cluster URI.

---

## 📁 Repository Structure

```text
Pharma-main/
├── server/                  <-- MERN Backend Application (Node.js/Express)
│   ├── config/              <-- Database and CORS configs
│   ├── controllers/         <-- Business logic (Auth, Products, Cart, Orders, Admin)
│   ├── middleware/          <-- Express Middlewares (Validation, Upload, JWT Auth)
│   ├── models/              <-- Mongoose Schemas (User, Admin, Product, Order, Cart)
│   ├── routes/              <-- API Endpoints
│   └── tests/               <-- Integration tests (Auth, Business)
└── client/                  <-- MERN Frontend Application (Vite/React/Tailwind)
    ├── src/
    │   ├── api/             <-- Axios API wrappers
    │   ├── components/      <-- Reusable UI controls (DataTable, Input, Buttons)
    │   ├── layouts/         <-- Routing layouts (Customer, Admin)
    │   ├── pages/           <-- Customer and Admin panel pages
    │   ├── router/          <-- React Router guards and paths
    │   └── store/           <-- Zustand global state management
```

---

## 🚀 Setup & Execution

### 1. Server Configuration & Database Seeding

1.  Navigate to the server directory:
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure variables:
    *   Duplicate `.env.example` to `.env` and fill in your connection string:
        ```bash
        cp .env.example .env
        ```
4.  Start the Server:
    *   **Development**: `npm run dev` (starts nodemon reload)
    *   **Production**: `npm run start`
    *   **Verify Tests**: `npm run test` (spins up in-memory MongoDB servers, testing endpoints)

### 2. Client Configuration

1.  Navigate to the client directory:
    ```bash
    cd ../client
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure variables:
    *   Duplicate `.env.example` to `.env`:
        ```bash
        cp .env.example .env
        ```
4.  Start Client:
    *   **Development**: `npm run dev` (runs dev server at `http://localhost:5173`)
    *   **Production Build**: `npm run build`

---

## 🔑 Migrated Credentials & Login

Because passwords were encrypted during the migration, the legacy plaintext values are re-hashed with `bcryptjs`. You can use the following default profiles to access the system:

### 1. Admin Portal (`/admin/login`)
*   **Email**: `admin@gmail.com`
*   **Plain Password**: `admin`
*   **Role**: `superadmin`
*(Note: There are other migrated admin profiles like `admin1@gmail.com` to `admin3@gmail.com` with password `admin`)*.

### 2. Customer Portal (`/login`)
*   **Email**: `user@gmail.com`
*   **Plain Password**: `user`
*   *Other user profiles available in the SQL dump (e.g. `kalinda@gmail.com` with password `5Kalinda`)*.

---

## ⛅ Deployment Guidelines

To launch this application in a production environment:

1.  **Database**: Spin up a free cluster on [MongoDB Atlas](https://www.mongodb.com/products/platform/atlas-database), retrieve the connection string, and set it as `MONGO_URI` on your host.
2.  **Backend**: Deploy the `/server` folder to [Render](https://render.com/) or [Railway](https://railway.app/).
    *   *Image Persistence*: Note that Render's free tier uses ephemeral disks. If you upload new product images, they will disappear on server restart. In production, configure Cloudinary or AWS S3 for product images.
    *   *Environment Settings*: Ensure `NODE_ENV=production` is set in host configurations.
3.  **Frontend**: Deploy `/client` to [Vercel](https://vercel.com/) or [Netlify](https://netlify.com/). Connect the client build to the deployed backend base URL via `VITE_API_BASE_URL`.
