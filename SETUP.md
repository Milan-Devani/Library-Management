# 📚 Library Management System — Complete Setup & Installation Guide

This document contains everything needed to set up, configure, and run the **Library Management System** on any computer (**Windows**, **macOS**, or **Linux**) without errors or confusion.

---

## 📑 Table of Contents
1. [Prerequisites & Downloads](#1-prerequisites--downloads)
2. [Method 1: One-Click Automated Setup (Windows — Fastest)](#2-method-1-one-click-automated-setup-windows--fastest)
3. [Method 2: Manual Step-by-Step Setup (All Operating Systems)](#3-method-2-manual-step-by-step-setup-all-operating-systems)
   - [Step 2.1: Start MySQL Database](#step-21-start-mysql-database)
   - [Step 2.2: Create & Seed the Database](#step-22-create--seed-the-database)
   - [Step 2.3: Start PHP REST API Backend](#step-23-start-php-rest-api-backend)
   - [Step 2.4: Start React Frontend](#step-24-start-react-frontend)
4. [Default Login Credentials](#4-default-login-credentials)
5. [How to Verify & Test the System](#5-how-to-verify--test-the-system)
6. [Troubleshooting & Common Issues](#6-troubleshooting--common-issues)
7. [Project Presentation & Files](#7-project-presentation--files)

---

## 1. Prerequisites & Downloads

Ensure the following two software packages are installed on your device:

| Requirement | Minimum Version | Purpose | Free Official Download |
| :--- | :--- | :--- | :--- |
| **XAMPP** *(or standalone MySQL + PHP)* | PHP 8.0+ & MySQL / MariaDB | Runs MySQL database engine and PHP REST API | [Download XAMPP](https://www.apachefriends.org/download.html) |
| **Node.js** | v18.x or v20.x (LTS) | Runs the React.js + Vite frontend development server | [Download Node.js](https://nodejs.org/en/download) |

> 💡 **Tip:** When installing XAMPP, you only need the **Apache** and **MySQL** components.

---

## 2. Method 1: One-Click Automated Setup (Windows — Fastest)

If you are on Windows, the entire database initialization, dependency installation, and server startup is automated with a single batch script:

### Steps:
1. Open the **XAMPP Control Panel**.
2. Click **Start** next to **MySQL** (make sure the MySQL status turns green).
3. In the project root folder, double-click:
   ```
   setup.bat
   ```

### What `setup.bat` does automatically:
* ✅ Verifies your PHP and Node.js environment.
* ✅ Probes MySQL on ports `3306` and `3307`.
* ✅ Creates the database `library_management` and seeds it with 21 books, 10 authors, 8 categories, 10 students, active loans, and the default admin.
* ✅ Checks for `frontend/node_modules` and runs `npm install` if missing.
* ✅ Opens the **PHP Backend API** in a separate terminal window (`http://127.0.0.1:8000/api`).
* ✅ Opens the **React Frontend** in a separate terminal window (`http://localhost:5173`).
* ✅ Automatically opens your default web browser to the application login page.

---

## 3. Method 2: Manual Step-by-Step Setup (All Operating Systems)

Follow these steps if you are on **macOS**, **Linux**, or prefer manual terminal execution.

### Step 2.1: Start MySQL Database
* **Windows (XAMPP):** Open XAMPP Control Panel $\rightarrow$ Click **Start** on **MySQL**.
* **macOS (Homebrew / MAMP):**
  ```bash
  brew services start mysql
  ```
* **Linux (Ubuntu / Debian):**
  ```bash
  sudo systemctl start mysql
  ```

---

### Step 2.2: Create & Seed the Database

You can initialize the database using either **Option A (Automated CLI)** or **Option B (phpMyAdmin GUI)**:

#### Option A: Automated CLI Script (Recommended)
Open your terminal inside the project root folder and run:
```bash
php backend/setup_database.php
```
*(If PHP is not recognized in your command line, run using XAMPP's PHP path, e.g., `"C:\xampp\php\php.exe" backend/setup_database.php` or `"D:\xampp\php\php.exe" backend/setup_database.php`)*

#### Option B: Via phpMyAdmin (GUI)
1. Open your browser to `http://localhost/phpmyadmin`
2. Click **New** in the left sidebar.
3. Database name: `library_management` $\rightarrow$ Click **Create**.
4. Select the newly created `library_management` database from the left list.
5. Click the **Import** tab at the top.
6. Click **Choose File** and select `database/library_management.sql` from the project folder.
7. Click **Import** at the bottom.

---

### Step 2.3: Start PHP REST API Backend
Open a terminal in the project root folder and start PHP's built-in web server:
```bash
php -S 127.0.0.1:8000 -t backend
```
*(On Windows, you can simply double-click `start-backend.bat`)*

**Verify Backend:** Open `http://127.0.0.1:8000/api` in your browser.  
You should see:
```json
{
  "status": "success",
  "message": "Library Management System API is running"
}
```

---

### Step 2.4: Start React Frontend
Open a **new terminal window** (keep the backend terminal running), navigate to the `frontend` folder, install packages, and launch:
```bash
cd frontend
npm install
npm run dev
```
*(On Windows, you can simply double-click `start-frontend.bat`)*

Once started, Vite will output:
```
  VITE v5.4.14  ready in 320 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Open **`http://localhost:5173`** in your browser.

---

## 4. Default Login Credentials

Use the default administrator account to sign in:

* **URL:** `http://localhost:5173`
* **Email:** `admin@library.com`
* **Password:** `admin123`
* **Role:** Administrator / Head Librarian

---

## 5. How to Verify & Test the System

After logging in, test the key modules to verify full-stack connectivity:

1. **Dashboard Analytics:** Observe the 8 live metric cards (Total Books, Total Stock, Active Issues, Overdue, Fines, etc.).
2. **Book Catalog (`/books`):** Search for *"Algorithms"*, filter by Category, or click *"Add Book"* to register a new title.
3. **Student Directory (`/members`):** View registered students with roll numbers and active borrow limits.
4. **Issue Book (`/issues`):** Click *"Issue Book"*, select a student and an available book, and submit. Notice the book's available copies decrement automatically.
5. **Return Book (`/issues`):** Find an issued book and click *"Return"*. If overdue, observe the live calculated fine (₹5.00/day) and watch copies restore.
6. **Fines Management (`/fines`):** View the fine ledger and mark an unpaid fine as *"Paid"*.

---

## 6. Troubleshooting & Common Issues

### Issue 1: "Could not connect to MySQL server on port 3306 or 3307"
* **Cause:** MySQL service is not running or port is blocked.
* **Fix:**
  1. Open XAMPP Control Panel and verify the green light next to MySQL is active.
  2. If MySQL cannot start on port 3306, change its port to 3307 in XAMPP `my.ini` (`port=3307`). Our backend automatically tests and connects to port 3307 if 3306 is occupied!

### Issue 2: "Access denied for user 'root'@'localhost' (using password: YES/NO)"
* **Cause:** Your local MySQL `root` user has a custom password set.
* **Fix:**
  1. Open `backend/config/database.php`.
  2. Update line 15 with your password:
     ```php
     private $password = 'your_mysql_password';
     ```

### Issue 3: "'php' is not recognized as an internal or external command"
* **Cause:** PHP is installed with XAMPP but not added to your Windows system PATH.
* **Fix:**
  * If using `setup.bat`, the script already auto-detects `C:\xampp\php` and `D:\xampp\php`.
  * To run `php` from any command prompt:
    1. Press `Win + R`, type `sysdm.cpl`, press Enter.
    2. Go to **Advanced** tab $\rightarrow$ **Environment Variables**.
    3. Under **System Variables**, click `Path` $\rightarrow$ **Edit** $\rightarrow$ **New**.
    4. Add your XAMPP PHP path (e.g., `C:\xampp\php`). Click **OK**.

### Issue 4: "'node' or 'npm' is not recognized"
* **Cause:** Node.js is not installed or the terminal was not restarted after installation.
* **Fix:** Download and run the installer from [nodejs.org](https://nodejs.org), complete the installation, and restart your terminal.

### Issue 5: Port 8000 or 5173 is already in use
* **Fix:**
  * Change backend port in `start-backend.bat`: `php -S 127.0.0.1:8080 -t backend`
  * Then update API URL in `frontend/src/api/axios.js`: `baseURL: 'http://127.0.0.1:8080/api'`

---

## 7. Project Presentation & Files

All project presentation assets are located directly in the root directory:

* 📊 **PowerPoint Presentation (.pptx):** `Library_Management_System_Presentation.pptx` *(16-slide widescreen presentation)*
* 🌐 **Interactive Web Slides (.html):** `presentation.html` *(Open in Chrome/Edge; navigate with arrow keys)*
* 📝 **Presentation Script & Workflows:** `PRESENTATION_AND_WORKFLOW.md` *(Contains complete speaker notes, slide transcripts, and Mermaid system workflow diagrams)*

---

### 💡 Quick Summary Commands (Cheat Sheet)

```bash
# 1. Reset / Seed Database:
php backend/setup_database.php

# 2. Run Backend (from root):
php -S 127.0.0.1:8000 -t backend

# 3. Run Frontend (from root):
cd frontend && npm install && npm run dev
```
