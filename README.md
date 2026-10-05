# 🎯 AI CRM Dashboard

An AI-powered SaaS CRM dashboard that streamlines your customer relationship management with intelligent insights, kanban-style lead tracking, detailed analytics, and an intuitive modern interface.

---

## ✨ Features

- **📊 Intelligent Analytics** — View real-time metrics, conversion rates, and detailed charts powered by Recharts.
- **🤖 AI Insights** — Uses Google's Gemini AI to analyze leads, summarize communications, and provide actionable recommendations.
- **🔄 Drag-and-Drop Pipeline** — Kanban-style lead tracking allowing seamless pipeline management using `@dnd-kit`.
- **👥 Contact & Lead Management** — Efficiently store and manage details, notes, and tasks related to your contacts and leads.
- **📝 Task Management** — Keep track of to-dos and follow-ups with an integrated task tracking system.
- **🔐 Authentication** — Secure JWT-based authentication for user login and registration.
- **🌙 Theming** — Built-in theme context for a modern, responsive UI adaptable to different aesthetics.
- **⚡ Responsive Design** — Optimized for all screen sizes using Tailwind CSS.

---

## 🛠️ Tech Stack

| Layer        | Technologies                                                      |
| ------------ | ----------------------------------------------------------------- |
| **Frontend** | React 19, Vite, Tailwind CSS v4, React Router, Recharts, dnd-kit  |
| **Backend**  | Node.js, Express, Mongoose, JWT, bcryptjs, CORS                   |
| **AI**       | Google Gemini API (`@google/genai`)                               |
| **Database** | MongoDB                                                           |

---

## 📐 Architecture

```
┌──────────────────┐        ┌──────────────────────┐       ┌─────────────────┐
│                  │  REST  │                      │       │                 │
│   React (Vite)   │◄──────►│   Express API        │◄─────►│    MongoDB      │
│                  │        │                      │       │                 │
└──────────────────┘        └──────────┬───────────┘       └─────────────────┘
                                       │
                            ┌──────────▼───────────┐
                            │   Google Gemini API   │
                            │ (Insights & Analysis) │
                            └──────────────────────┘
```

The backend follows **MVC architecture**:

```
Routes → Controllers → Services → Models
```

- **Routes** define API endpoints for leads, contacts, tasks, auth, analytics, and AI.
- **Controllers** handle request/response logic and orchestrate database/service interactions.
- **Services** contain core business logic (e.g., Gemini AI integration).
- **Models** define MongoDB schemas with Mongoose (User, Lead, Contact, Task, Note).

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18+)
- **MongoDB** (local or Atlas)
- **Google Gemini API Key** — [Get one here](https://aistudio.google.com/apikey)

### 1. Clone the repository

```bash
git clone https://github.com/suryanshkhurana7/AI-CRM-Dashboard.git
cd AI-CRM-Dashboard
```

### 2. Setup Backend

```bash
cd Backend
npm install
```

Create a `.env` file in the `Backend/` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai-crm
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

Start the backend server:

```bash
npm run dev
```

The server runs on `http://localhost:5000`.

### 3. Setup Frontend

```bash
cd Frontend/AICRMDashboard
npm install
npm run dev
```

The frontend runs on `http://localhost:5173`.

---

## 📡 API Reference

### Authentication

| Method | Endpoint             | Description                  | Access  |
| ------ | -------------------- | ---------------------------- | ------- |
| POST   | `/api/auth/register` | Register a new user          | Public  |
| POST   | `/api/auth/login`    | Login with email & password  | Public  |
| GET    | `/api/auth/me`       | Get current user details     | Private |

### CRM Entities

| Method | Endpoint                                      | Description                                | Access  |
| ------ | --------------------------------------------- | ------------------------------------------ | ------- |
| GET    | `/api/leads`                                  | Get all leads for logged-in user           | Private |
| POST   | `/api/leads`                                  | Create a new lead                          | Private |
| PUT    | `/api/leads/:id`                              | Update lead (e.g. change pipeline stage)   | Private |
| GET    | `/api/contacts`                               | Manage contacts                            | Private |
| GET    | `/api/tasks`                                  | Manage tasks                               | Private |
| GET    | `/api/analytics`                              | Retrieve dashboard analytics               | Private |
| POST   | `/api/ai/insights`                            | Generate AI insights for a specific entity | Private |

---

## 📂 Project Structure

```
AI-CRM-Dashboard/
├── Backend/
│   ├── server.js                          # Entry point — connects DB & starts server
│   ├── package.json
│   ├── seed.js                            # DB Seeding script
│   └── src/
│       ├── config/                        # DB and other configurations
│       ├── controllers/
│       │   ├── auth.controller.js         # Register, login, user details
│       │   ├── lead.controller.js         # Leads logic
│       │   ├── contact.controller.js      # Contacts logic
│       │   ├── task.controller.js         # Tasks logic
│       │   ├── analytics.controller.js    # Analytics aggregation
│       │   └── ai.controller.js           # AI insights generation
│       ├── middleware/
│       │   └── auth.middleware.js         # JWT verification middleware
│       ├── models/
│       │   ├── User.js                    # User schema
│       │   ├── Lead.js                    # Lead schema
│       │   ├── Contact.js                 # Contact schema
│       │   ├── Task.js                    # Task schema
│       │   └── Note.js                    # Note schema
│       ├── routes/
│       │   ├── auth.route.js              # Auth API routes
│       │   ├── lead.route.js              # Leads API routes
│       │   ├── contact.route.js           # Contacts API routes
│       │   ├── task.route.js              # Tasks API routes
│       │   ├── analytics.route.js         # Analytics API routes
│       │   └── ai.route.js                # AI API routes
│       └── services/
│           └── ai.service.js              # Gemini AI integration
│
└── Frontend/
    └── AICRMDashboard/
        ├── index.css                      # Tailwind base styles
        ├── vite.config.js
        ├── package.json
        └── src/
            ├── main.jsx                   # React entry point
            ├── App.jsx                    # App shell with router
            ├── context/
            │   └── ThemeContext.jsx       # Theme context provider
            ├── components/
            │   ├── layout/                # Topbar, Sidebar, etc.
            │   ├── ui/                    # Reusable UI components
            │   └── ...                    # Feature specific components
            └── pages/
                ├── Dashboard.jsx          # Analytics & Overview
                ├── Leads.jsx              # Kanban Board
                ├── Contacts.jsx           # Contacts Table
                └── ...
```

---

## 🔒 How Authentication Works

1. On **register/login**, the server creates a JWT token and sends it to the client.
2. The client stores the token (typically in localStorage) and includes it in the `Authorization: Bearer <token>` header.
3. The `auth.middleware` verifies the token on every protected API route and attaches `req.user`.

---

## 🤖 How AI Features Work

1. Users can request AI insights on leads or general CRM health from the dashboard.
2. The backend gathers relevant CRM context (lead notes, contact history, pipeline stage).
3. This aggregated data is sent to the **Google Gemini API** (`@google/genai`).
4. Gemini processes the context and returns structured insights, next-step recommendations, or summaries.
5. The frontend displays these insights via interactive dashboard widgets.

---

## 📄 License

This project is licensed under the [ISC License](https://opensource.org/licenses/ISC).
