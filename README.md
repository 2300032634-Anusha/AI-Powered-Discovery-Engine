# 🛍️ AI-Powered Discovery Engine & E-Commerce Recommendation System

An enterprise-grade **AI-Powered E-Commerce Discovery Engine & Recommendation System** built with **React (Vite)** on the frontend and **Node.js (Express)** + **MySQL** on the backend.

---

## 📋 System Requirements & Prerequisites
Before running this project on any system, make sure the following software is installed:

- **[Node.js](https://nodejs.org/)** (v18.0.0 or higher)
- **[npm](https://www.npmjs.com/)** (v9.0.0 or higher, bundled with Node.js)
- **[MySQL Community Server](https://dev.mysql.com/downloads/mysql/)** (v8.0+, running on port 3306)
- **[Visual Studio Code](https://code.visualstudio.com/)** (recommended IDE)

---

## 📁 Project Structure & Dependencies

```
discovery-engine-app/
├── package.json              # Frontend dependencies (React, Vite, Lucide icons)
├── vite.config.js            # Vite build & proxy settings (Port 3000 -> 5000)
├── index.html                # Main web application entrypoint
├── .env.example              # Frontend environment configuration template
├── setup.bat / start.bat     # 1-Click setup & execution scripts (Windows)
├── setup.sh / start.sh       # 1-Click setup & execution scripts (Mac/Linux)
├── src/                      # React Frontend Source Code
│   ├── App.jsx               # Main React Application Container
│   ├── components/           # UI Components (Discovery Studio, RAG Assistant, etc.)
│   └── index.css             # Glassmorphism & Modern Styling Engine
└── server/                   # Express Backend API Server
    ├── package.json          # Backend dependencies (Express, MySQL2, Cors, Dotenv)
    ├── index.js              # Express API Server Initialization (Port 5000)
    ├── .env.example          # Backend environment configuration template
    ├── config/db.js          # MySQL connection pool configuration
    ├── controllers/          # Business logic handlers (Auth, Products, Orders, etc.)
    ├── routes/               # Express REST API Routes
    └── migrations/           # Database migrations & initial seed data
        ├── init.sql          # Complete MySQL database schema & sample dataset
        └── runMigration.js   # Automated migration script
```

---

## ⚙️ Environment Variables Setup

Environment templates are provided in both root and server directories:

1. **Root `.env.example`** → Frontend API link:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
2. **Server `server/.env.example`** → Database and API configuration:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=discovery_engine_db
   FRONTEND_URL=http://localhost:3000
   ```

*Copy `server/.env.example` to `server/.env` and update `DB_PASSWORD` with your local MySQL root password.*

---

## 🚀 How to Open and Run in VS Code on Another Computer

### Option A: 1-Click Automatic Setup (Recommended for Windows)

1. Open VS Code and open the extracted `discovery-engine-app` folder (`File > Open Folder`).
2. Open VS Code Terminal (`Ctrl + ~` or `Terminal > New Terminal`).
3. Run the setup script to install dependencies and initialize MySQL database:
   ```cmd
   setup.bat
   ```
4. Run the start script to launch both Frontend and Backend servers:
   ```cmd
   start.bat
   ```
   - **Frontend App UI**: [http://localhost:3000](http://localhost:3000)
   - **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)

---

### Option B: 1-Click Setup (Mac / Linux)

1. Open VS Code and open the extracted `discovery-engine-app` folder.
2. Open terminal in VS Code and run:
   ```bash
   chmod +x setup.sh start.sh
   ./setup.sh
   ./start.sh
   ```

---

### Option C: Manual Setup Step-by-Step (Any OS)

#### Step 1: Install Dependencies
Open terminal in VS Code:
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
npm --prefix server install
```

#### Step 2: Configure Server `.env`
Create `server/.env` from template:
```bash
cp server/.env.example server/.env
```
Edit `server/.env` and enter your local MySQL password for `DB_PASSWORD`.

#### Step 3: Run Database Migration & Seeding
Execute the automated database creation and seed script:
```bash
npm --prefix server run migrate
```
*This creates the `discovery_engine_db` database, table schema, and seeds products, personas, and RAG knowledge data.*

#### Step 4: Run Application
Open two terminal tabs in VS Code:

**Terminal 1 (Backend API):**
```bash
cd server
npm start
```

**Terminal 2 (Frontend App):**
```bash
npm run dev
```

Visit **[http://localhost:3000](http://localhost:3000)** in your web browser.

---

## ❓ Troubleshooting & FAQs

- **`Access denied for user 'root'@'localhost'`**:
  Ensure the password in `server/.env` matches your local MySQL server's root password.
- **`ECONNREFUSED 127.0.0.1:3306`**:
  Make sure your MySQL service is running on your machine.
- **`Port 3000 or 5000 is already in use`**:
  Kill any lingering Node processes or restart your terminal before launching `start.bat`.
