# 🚀 JobPortal — Full-Stack MERN Job Portal

A production-ready job portal application built with the MERN stack (MongoDB, Express.js, React.js, Node.js), featuring AI-powered skill matching, real-time chat, resume builder, and complete role-based dashboards.

---

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based login / signup / logout
- Role-based access control: **Candidate**, **Recruiter**, **Admin**
- Protected routes per role

### 👤 Candidate
- Profile builder (skills, experience, education, bio, social links)
- Profile completion progress indicator
- Resume builder with **PDF export** (jsPDF)
- Browse, search, and filter jobs (skill, location, type, salary, experience)
- Save / bookmark jobs
- **Skill match score** for every job (matched vs missing skills)
- Apply with cover letter
- Track all applications with timeline & status history
- AI-powered job recommendations based on skills
- Real-time chat with recruiters

### 🏢 Recruiter
- Company profile management
- Create, edit, delete job listings (skills, salary, experience, deadlines)
- View applicants per job with skill-match rankings
- Update application status (viewed → shortlisted → interview → accepted/rejected)
- Real-time notifications on new applications
- Chat with candidates

### 🛠️ Admin
- Dashboard with stats and charts (Recharts)
- Manage all users (activate/deactivate/delete)
- Manage all jobs (feature/pause/close)
- Monthly application trend chart

### 💬 Real-Time Chat
- Socket.io powered chat
- Online/offline status indicators
- Unread message badges
- Conversation list with last message preview

### 🔔 Notifications
- In-app notification centre
- Unread count badge
- Mark all as read
- Socket.io real-time push

---

## 🗂️ Project Structure

```
jobportal/
├── backend/
│   ├── controllers/          # Business logic
│   │   ├── authController.js
│   │   ├── jobController.js
│   │   ├── applicationController.js
│   │   ├── userController.js
│   │   ├── notificationController.js
│   │   ├── messageController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   └── auth.js           # JWT protect + authorize
│   ├── models/
│   │   ├── User.js           # Candidate & Recruiter schema
│   │   ├── Job.js
│   │   ├── Application.js
│   │   ├── Notification.js
│   │   └── Message.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── jobs.js
│   │   ├── applications.js
│   │   ├── notifications.js
│   │   ├── messages.js
│   │   └── admin.js
│   ├── utils/
│   │   ├── skillMatch.js     # Skill matching algorithm
│   │   └── notifications.js  # Notification helpers
│   ├── seed.js               # Demo data seeder
│   ├── server.js             # Express + Socket.io server
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    └── src/
        ├── components/
        │   ├── common/
        │   │   ├── Navbar.jsx
        │   │   └── Navbar.css
        │   └── jobs/
        │       ├── JobCard.jsx
        │       └── JobCard.css
        ├── context/
        │   ├── AuthContext.jsx   # Global auth state
        │   └── SocketContext.jsx # Socket.io + notifications
        ├── pages/
        │   ├── Landing.jsx
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── Jobs.jsx          # Job listing with filters
        │   ├── JobDetail.jsx     # Job detail + apply + match
        │   ├── Messages.jsx      # Real-time chat
        │   ├── NotFound.jsx
        │   ├── candidate/
        │   │   ├── Dashboard.jsx
        │   │   ├── Profile.jsx
        │   │   ├── Applications.jsx
        │   │   ├── ResumeBuilder.jsx
        │   │   └── SavedJobs.jsx
        │   ├── recruiter/
        │   │   ├── Dashboard.jsx
        │   │   ├── Profile.jsx
        │   │   ├── PostJob.jsx
        │   │   └── Applications.jsx
        │   └── admin/
        │       ├── Dashboard.jsx
        │       ├── Users.jsx
        │       └── Jobs.jsx
        ├── services/
        │   └── api.js            # Axios API service layer
        ├── App.jsx
        ├── index.js
        └── index.css             # Global design system
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router 6, React Hot Toast, React Icons |
| State | React Context API |
| HTTP | Axios |
| Charts | Recharts |
| PDF | jsPDF |
| Real-time | Socket.io-client |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Real-time | Socket.io |
| Fonts | Google Fonts (Syne + DM Sans) |

---

## ⚡ Quick Start

### Prerequisites
- **Node.js** ≥ 18
- **MongoDB** running locally on port 27017 (or a MongoDB Atlas URI)

### 1. Clone & Install

```bash
# Install root dev deps (concurrently)
npm install

# Install backend & frontend deps
npm run install-all
```

### 2. Configure Environment

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/jobportal
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

```bash
cd ../frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

### 3. Seed Demo Data

```bash
npm run seed
```

This creates demo accounts and sample jobs/applications.

### 4. Run Development Servers

```bash
npm run dev
```

This starts both servers concurrently:
- Backend: http://localhost:5000
- Frontend: http://localhost:3000

---

## 🔑 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@demo.com | demo123 |
| Recruiter | recruiter@demo.com | demo123 |
| Recruiter 2 | recruiter2@demo.com | demo123 |
| Candidate | candidate@demo.com | demo123 |
| Candidate 2 | candidate2@demo.com | demo123 |

> You can also use the **"Try demo"** buttons on the Login page.

---

## 🌐 API Reference

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| PUT | /api/auth/password | Update password |

### Jobs
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/jobs | List jobs (with filters & pagination) |
| GET | /api/jobs/:id | Job detail + skill match |
| POST | /api/jobs | Create job (recruiter) |
| PUT | /api/jobs/:id | Update job |
| DELETE | /api/jobs/:id | Delete job |
| GET | /api/jobs/recommended | AI job recommendations (candidate) |
| GET | /api/jobs/recruiter | Recruiter's own jobs |
| POST | /api/jobs/:id/save | Save/unsave job |

### Applications
| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/applications/job/:jobId | Apply to job |
| GET | /api/applications/candidate | Candidate's applications |
| GET | /api/applications/recruiter | Recruiter's applications |
| GET | /api/applications/:id | Application detail |
| PUT | /api/applications/:id/status | Update status |
| DELETE | /api/applications/:id | Withdraw application |

### Users
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/users/profile/:id? | Get profile |
| PUT | /api/users/profile | Update profile |
| PUT | /api/users/resume | Update resume |
| GET | /api/users/saved-jobs | Saved jobs |
| GET | /api/users/candidates | Search candidates (recruiter) |

### Notifications
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/notifications | Get notifications |
| PUT | /api/notifications/read | Mark read |
| DELETE | /api/notifications/:id | Delete |

### Messages
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/messages/conversations | List conversations |
| GET | /api/messages/:userId | Get messages |
| POST | /api/messages/:userId | Send message |

### Admin
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/admin/stats | Dashboard stats |
| GET | /api/admin/users | List users |
| PUT | /api/admin/users/:id/toggle | Toggle user active |
| DELETE | /api/admin/users/:id | Delete user |
| GET | /api/admin/jobs | List all jobs |
| PUT | /api/admin/jobs/:id/status | Change job status |
| PUT | /api/admin/jobs/:id/featured | Toggle featured |

---

## 🧩 Skill Matching Algorithm

```
matchScore = (matched skills / total required skills) × 100
```

- **≥ 70%** → High match (green)  
- **40–69%** → Medium match (amber)  
- **< 40%** → Low match (red)

Recommendations filter jobs with ≥ 30% match and sort by score descending.

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first.

---

## 📄 License

MIT
