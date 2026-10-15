
# CampusOS

> A centralized campus club and event management platform designed to organize club activities, event registrations, memberships, and attendance.

## 📌 Overview

**CampusOS** is a web-based campus club and event management system developed to bring important campus activities into one platform.

It supports workflows related to users, clubs, events, club memberships, event registrations, attendance, and notifications.

The project was developed as part of engineering coursework to apply practical concepts in **frontend development, backend development, REST APIs, database management, and software testing**.

---

## 🎯 Objectives

* Provide a centralized platform for campus clubs and events.
* Organize club membership and event registration workflows.
* Support event submission and approval activities.
* Maintain records of event registrations and attendance.
* Provide functionality for different user roles.
* Store application data in a structured relational database.
* Apply software engineering and browser automation concepts.

---

## ✨ Features

* 👤 **User Management and Authentication**
  Supports user registration, login, profile access, and roles such as Student, Club Admin, Faculty Coordinator, and System Admin.

* 🎓 **Club Management**
  Supports club listing and management, coordinator-related functionality, and membership applications and review workflows.

* 📅 **Event Management**
  Supports event listing, event details, submission, and approval-related workflows.

* 📝 **Event Registration**
  Provides functionality for students to register for events and access registration-related information.

* ✅ **Attendance Management**
  Maintains event attendance records and includes attendance-marking functionality.

* 🔔 **Notifications**
  Includes notification listing, unread counts, and read-status functionality.

* 📊 **Administration**
  Includes platform statistics and user-management routes.

* 📈 **Student Participation**
  Includes personal registrations, participation reports, and event recommendations.

---

## 🛠️ Technologies Used

### Frontend

* **React** – Builds the interactive user interface using reusable components.
* **Vite** – Runs the frontend development server and builds the application.
* **Axios** – Sends HTTP requests to the backend API.
* **HTML, CSS, and JavaScript** – Support the web interface.

### Backend

* **Python** – Backend programming language.
* **Django** – Backend web framework.
* **Django REST Framework** – Provides the REST API layer.

### Database

* **MySQL** – Stores users, clubs, events, memberships, registrations, attendance, notifications, and announcements.

### Testing and Development Tools

* **Selenium with Python** – Automates browser checks.
* **Visual Studio Code** – Code editor.
* **Git** – Version control.
* **GitHub** – Source code hosting.

---

## 🏗️ Application Architecture

CampusOS uses a separate frontend, backend, and database.

1. **React frontend:** Displays pages, forms, and interactive components.
2. **API communication:** Axios sends HTTP requests to Django REST Framework.
3. **Django backend:** Processes requests and implements backend operations.
4. **MySQL database:** Stores and retrieves application records.

Local development URLs:

* Frontend: `http://localhost:5173/`
* Backend: `http://127.0.0.1:8000/`
* API base URL: `http://127.0.0.1:8000/api`

The frontend communicates with MySQL through the backend API rather than connecting directly to the database.

---

## 🗄️ Database Overview

The Django models map to these MySQL tables:

* `users` – User information and roles.
* `clubs` – Club details and assigned users.
* `events` – Event information and approval-related fields.
* `club_memberships` – Membership applications and review status.
* `event_registrations` – Student event registrations.
* `attendance` – Event attendance records.
* `notifications` – Notifications for users.
* `announcements` – Club announcements.

The models define relationships between users, clubs, and events. Memberships, registrations, and attendance records include uniqueness rules for relevant record pairs.

---

## ⚙️ Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/vaishnavi519/CampusOS.git
cd CampusOS
```

### 2. Set Up the Backend Environment

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
```

If the virtual environment already exists, you can activate it without recreating it.

Install backend dependencies if a `requirements.txt` file is available in the backend directory:

```powershell
python -m pip install -r requirements.txt
```

### 3. Configure MySQL

Make sure MySQL is running and the `campus_os` database and required tables are available.

Configure the database connection using your local credentials. Do not commit database passwords or secret keys to GitHub.

Because the current models use `managed = False`, do not assume that creating and applying migrations is necessary or safe for the existing database.

### 4. Run the Django Backend

From the `backend` directory:

```powershell
python manage.py runserver
```

The backend runs at:

```text
http://127.0.0.1:8000/
```

### 5. Run the React Frontend

Open a separate terminal:

```powershell
cd frontend
npm install
npm run dev
```

The frontend is expected at:

```text
http://localhost:5173/
```

The local frontend environment configuration uses:

```text
VITE_API_URL=http://127.0.0.1:8000/api
```

Restart the frontend server after changing environment variables.

---

## 🔐 Security Notes

* Never commit passwords, database credentials, API secrets, or private `.env` values.
* Use designated test accounts for demonstrations.
* Avoid displaying private user information or password hashes.
* Enforce permissions in the backend; hiding frontend buttons is not sufficient access control.
* Configure secure settings before deploying publicly.

---

## 🚀 Future Enhancements

* 📱 Further responsive and mobile-friendly improvements.
* 🧪 More automated tests for authentication, permissions, and complete workflows.
* 📊 Enhanced analytics and reporting.
* 🔎 Improved search and filtering.
* 📧 Reliable email integration.
* ☁️ Production deployment, monitoring, and security hardening.
* ♿ Accessibility improvements.

---

## 📚 Learning Outcomes

This project provides practical experience with:

* Building interactive interfaces using React.
* Developing backend functionality using Django and Django REST Framework.
* Connecting frontend requests to backend APIs.
* Managing relational data using MySQL.
* Organizing application functionality into modules.
* Automating browser checks with Selenium and Python.
* Managing source code using Git and GitHub.

---

**Project:** CampusOS – Campus Club and Event Management System  
**Frontend:** React + Vite  
**Backend:** Python + Django + Django REST Framework  
**Database:** MySQL  
**Automation:** Selenium with Python
