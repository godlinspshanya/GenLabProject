# Task Manager

A full-stack Task Management application developed during my internship at **GenLab Pvt. Ltd.** The application allows users to securely register, log in, and manage their daily tasks through a clean and responsive interface.

## 🚀 Features

- **User Registration:** Register with name, email, phone number, and gender.
- **Email OTP Verification:** Secure account registration and login using email OTP.
- **Google Sign-In:** Authenticate using a Google account.
- **JWT Authentication:** Secure user sessions using JSON Web Tokens.
- **Task Management:** Create, view, update, and delete personal tasks.
- **MongoDB Integration:** Store user and task information in MongoDB Atlas.
- **Google Sheets Integration:** Automatically record successfully registered users in a Google Sheet.
- **Responsive UI:** Clean and user-friendly interface.

## 🛠️ Tech Stack

### Frontend
- React.js
- Vite
- JavaScript
- CSS
- React Router
- Lucide React
- Motion

### Backend
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JSON Web Token (JWT)
- Nodemailer
- Google OAuth 2.0

### Additional Integration
- Google Apps Script
- Google Sheets

## 📁 Project Structure


Task-Manager/
│
├── public/
│
├── server/
│   ├── models/
│   │   ├── User.js
│   │   └── Task.js
│   │
│   ├── index.js
│   ├── package.json
│   ├── package-lock.json
│   └── .env
│
├── src/
│   │
│   ├── assets/
│   │   ├── Google.png
│   │   ├── hero.png
│   │   ├── zion logo.png
│   │   └── student-illustration.png.png
│   │
│   ├── components/
│   │   ├── AddTaskForm.jsx
│   │   ├── Divider.jsx
│   │   ├── Divider.css
│   │   ├── GoogleButton.jsx
│   │   ├── GoogleButton.css
│   │   ├── InputField.jsx
│   │   ├── InputField.css
│   │   ├── Logo.jsx
│   │   ├── Logo.css
│   │   ├── Sidebar.jsx
│   │   └── TaskTable.jsx
│   │
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── Signup.css
│   │   ├── OTP.jsx
│   │   ├── Landing.jsx
│   │   ├── Landing.css
│   │   ├── Home.jsx
│   │   ├── MyTasks.jsx
│   │   └── Users.jsx
│   │
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
│
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── README.md
└── vite.config.js

## ⚙️ Installation and Setup

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### 2. Navigate to the Project

```bash
cd NewProject(GenLab)
```

### 3. Install Frontend Dependencies

```bash
npm install
```

### 4. Install Backend Dependencies

```bash
cd server
npm install
```

### 5. Configure Environment Variables

Create a `.env` file inside the `server` folder.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

GOOGLE_SHEET_WEB_APP_URL=your_google_apps_script_web_app_url
GOOGLE_SHEET_SECRET=your_private_secret_token
```

Replace the placeholder values with your actual credentials. Never upload your `.env` file or expose private credentials on GitHub.

## ▶️ Running the Application

### Start the Backend

Open a terminal:

```bash
cd server
npm start
```

If your backend does not have a start script, use:

```bash
node index.js
```

### Start the Frontend

Open another terminal in the main project directory:

```bash
npm run dev
```

The frontend will typically run at:

```text
http://localhost:5173
```

The backend runs at:

```text
http://localhost:5000
```

## 🔐 Authentication Flow

1. Users enter their registration details.
2. An OTP is sent to their registered email address.
3. Users verify the OTP.
4. Verified user details are stored in MongoDB Atlas.
5. Registration details are synchronized with Google Sheets.
6. Users can log in using email OTP or Google Sign-In.

## 📋 Task Management

Authenticated users can:
- Create new tasks.
- View their tasks.
- Edit existing tasks.
- Delete completed or unwanted tasks.

Each user can access their own tasks.

## 🔮 Future Enhancements

- Task priority and category management.
- Task deadlines and reminders.
- Task status tracking.
- Dashboard analytics.
- Improved mobile responsiveness.

## 👩‍💻 Project Information

**Project:** Task Manager  
**Organization:** GenLab Pvt. Ltd.  
**Domain:** Full Stack Web Development  
**Type:** Internship Project

---

*Built to simplify daily task organization and improve productivity.*
