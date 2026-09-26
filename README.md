# Woffy | Smart Pet Healthcare & Digital Care Ecosystem

<div align="center">

![Woffy Banner](https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=1200&q=80)

**An all-in-one modern pet care management, automated WSAVA vaccination tracking, emergency QR collar tag, and veterinary services platform.**

[![Node.js Version](https://img.shields.io/badge/Node.js-v18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.19-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Mongoose%20v9-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media%20Storage-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-Responsive_UI-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg?style=for-the-badge)](LICENSE)

[Features](#-key-features) • [Project Structure](#-project-structure) • [Tech Stack](#%EF%B8%8F-tech-stack) • [Quick Start](#-quick-start--installation) • [API Routes](#-api--route-endpoints) • [Environment Config](#%EF%B8%8F-environment-variables) • [Deployment](#-deployment)

</div>

---

## 📖 About Woffy (React + Node.js Architecture)

**Woffy** is an enterprise-grade pet healthcare management platform engineered with a modern, decoupled architecture:
- **Frontend (`frontend/`)**: Modern **React 19** Single Page Application (SPA) built with **Vite**, **Tailwind CSS**, **React Router v7**, **Lucide Icons**, and **Axios**.
- **Backend (`backend/`)**: High-performance **Node.js + Express REST API** with **MongoDB (Mongoose)**, **JWT Authentication**, and Cloudinary media processing.
- **Root Runner (`package.json`)**: Convenient monorepo management scripts powered by `concurrently` to run both services together or independently.

From generating life-saving **QR-enabled emergency collar tags** and automating **veterinary vaccination schedules** to finding verified 24/7 animal hospitals, Woffy provides pet parents and veterinarians with a fast, responsive, and seamless experience across desktop and mobile.

---

## ✨ Key Features

### 🐶 1. Pet Profile & Digital Identity

- **Comprehensive Profiles:** Manage multiple pets with details like name, species (Dog/Cat), breed, gender, age, date of birth, weight, color, microchip number, and temperament.
- **Cloud Photo Gallery:** Upload high-resolution primary pet avatars and multi-photo galleries powered by Cloudinary and Multer.
- **Centralized Pet Dashboard:** Quick-access switchboard to manage pet vitals, health status, and quick shortcuts.

---

### 🏷️ 2. Smart Emergency Collar QR Tag & Lost Pet Mode

- **Unique QR Tag Generation:** Auto-generates unique collar IDs (e.g. `WF-MAX-8921`) and high-resolution downloadable QR codes.
- **Public Finder Scan View:** If a lost pet is found, anyone scanning the QR collar tag instantly accesses the emergency contact details, medical alerts, allergies, and vet information—_no login required_.
- **1-Click Lost Dog Alert Mode:** Pet parents can toggle emergency "Lost" status, displaying a prominent red SOS alert with emergency contact numbers on the public scan page.
- **Printable Tag & Wallet Cards:** Printable sheet ready for collar tags, wallet cards, or keychain laminations.

---

### 💉 3. WSAVA Vaccination & Deworming Protocol Engine

- **Automated Medical Protocols:** Automatically generates scientifically backed vaccination and deworming schedules according to WSAVA (World Small Animal Veterinary Association) and Indian Veterinary guidelines for dogs (Puppy DP, 7-in-1, 9-in-1 MegaVac, Anti-Rabies, Kennel Cough) and cats (Tricat/FVRCP, Rabies).
- **Dynamic Real-Time Status:** Calculates immunization status dynamically (`Upcoming`, `Due Soon`, `Overdue`, `Completed`).
- **Digital Pet Vaccination Passport:** Printable, verifiable medical passport sheet with clinic stamps, vet names, and certificate photo attachments.
- **Email Immunization Reminders:** Automated and on-demand email notifications sent to pet owners when vaccinations are due.

---

### 📋 4. Daily Health Logs & Activity Tracking

- **Multi-Category Tracking:** Record meals, medication intake, daily walks, behavioral changes, symptoms, and vet visits.
- **Photo Attachments & Notes:** Upload prescription slips or medical photos with timestamps.
- **Filterable History Timeline:** View structured chronological logs per pet to share with veterinarians during consultations.

---

### 🏥 5. Veterinary Hospitals & Emergency Rescue Directory

- **Verified Vet Clinics:** Searchable directory of veterinary clinics, multi-specialty animal hospitals, and 24/7 emergency emergency helplines.
- **Community Hospital Submissions:** Users and clinic owners can submit new hospitals for listing with verification workflows.
- **Animal Rescue & Shelter Network:** Direct contact directory for verified NGOs, stray rescue services, and animal ambulance helplines across major cities.

---

### 🛍️ 6. Curated Pet Care Marketplace

- **Products Catalog:** Curated showcase of premium dog and cat food, grooming shampoos, durable chew toys, supplements, and accessories.
- **User Product Listing Requests:** Users can submit product suggestions and listing requests directly from their dashboard.

---

### 🛡️ 7. Full-Featured Admin Panel

- **Unified Management Dashboard:** Real-time metrics on registered users, active pets, pending clinic listings, and rescue services.
- **Hospital Approvals:** Moderation queue to verify, approve, edit, or reject submitted veterinary clinics.
- **Marketplace & Rescue Moderation:** Add, update, stock-toggle, or remove store products and rescue organizations.

---

### 🔐 8. Authentication, Google OAuth 2.0 & Multi-Channel Recovery

- **Google OAuth 2.0 Social Sign-In:** 1-Click login and instant registration with Google accounts without passwords.
- **Session Security:** Persistent sessions with `express-session` and `connect-mongo` backed by MongoDB.
- **Password Security:** Salted password hashing with `bcrypt`.
- **Dual Reset Flow:**
  1. **1-Click Magic Link:** Cryptographically secure tokenized URL sent via email.
  2. **6-Digit Secure OTP:** Time-limited verification code with dedicated OTP verification screen.
- **Multi-Engine Email Delivery:** Ultra-fast email delivery supporting Resend REST API, Brevo API, and Gmail Direct SSL pool fallback.

---

## 📁 Project Structure

```
Woffy/
├── package.json                     # Monorepo runner (concurrently scripts)
├── README.md                        # Documentation
│
├── frontend/                        # ⚡ Modern React 19 Frontend SPA (Vite + Tailwind)
│   ├── index.html                   # HTML entry point
│   ├── vite.config.js               # Vite config & API/Uploads proxy to backend
│   ├── package.json                 # Frontend dependencies (React Router, Axios, Lucide)
│   └── src/
│       ├── main.jsx                 # React root mount
│       ├── App.jsx                  # Main router, route definitions & auth wrapping
│       ├── index.css                # Tailwind CSS v4 styling rules
│       ├── components/              # Shared components (Navbar, Footer, ProtectedRoute, AdminRoute)
│       ├── context/                 # AuthContext (JWT + Session state management)
│       ├── services/                # Axios API client with Bearer token interceptor
│       └── pages/                   # All 20+ Application pages
│           ├── LandingPage.jsx      # Hero, features, guide, contact form
│           ├── LoginPage.jsx        # Login with email/pass & Google OAuth
│           ├── SignupPage.jsx       # Account registration
│           ├── ForgotPasswordPage.jsx # Password reset link & OTP request
│           ├── ResetPasswordPage.jsx  # Token or 6-digit OTP verification
│           ├── DashboardPage.jsx    # Primary user dashboard & pet cards
│           ├── PetProfilesPage.jsx  # Pet family gallery & lost pet badges
│           ├── PetDetailPage.jsx    # 1-Click lost switch, QR tag, vet details
│           ├── CreatePetPage.jsx    # Multi-step pet registration with photo upload
│           ├── EditPetPage.jsx      # Pet profile updater
│           ├── PrintableTagPage.jsx # Print-ready collar tags & wallet cards
│           ├── PublicPetTagPage.jsx # Public emergency finder view (Call / WhatsApp GPS)
│           ├── VaccinationsPage.jsx # WSAVA auto-schedule & dose management
│           ├── VaccinePassportPage.jsx # Official printable digital vaccine passport
│           ├── TrackingRecordsPage.jsx # Health logs, weight charts, vet records
│           ├── RescueDirectoryPage.jsx # 24/7 NGO helplines & shelter waitlist
│           ├── ShopPage.jsx         # Curated pet essentials marketplace
│           ├── SettingsPage.jsx     # Profile updates, password, account deletion
│           ├── AdminDashboardPage.jsx # Hospital approvals & marketplace moderation
│           └── NotFoundPage.jsx     # Dog-themed 404 page
│
└── backend/                         # 🚀 Node.js + Express REST API Backend
    ├── package.json                 # Backend dependencies & scripts
    ├── .env                         # Environment variables (Mongo, Cloudinary, JWT, Email)
    └── src/
        ├── app.js                   # Express REST app, CORS, routes & middlewares
        ├── server.js                # Server entry point (Default: http://localhost:5000)
        ├── Controllers/             # JSON REST controllers (dual JSON/EJS support)
        ├── Middlewares/             # JWT + Session authentication & Multer upload
        ├── Models/                  # Mongoose Schemas (Pet, User, Vaccination, Record, etc.)
        ├── Routes/                  # RESTful API route endpoints
        ├── Utils/                   # Mailer, JWT helpers, WSAVA scheduler, QR generator
        └── Database/                # MongoDB connection & seed scripts
```

---

## 🛠️ Tech Stack

| Domain                  | Technology / Library                | Description                                                 |
| :---------------------- | :---------------------------------- | :---------------------------------------------------------- |
| **Runtime & Framework** | `Node.js` + `Express.js 4.19`       | High-performance asynchronous backend server                |
| **Database & ODM**      | `MongoDB Atlas` + `Mongoose 9.x`    | Scalable NoSQL document store with data validation          |
| **Session Management**  | `express-session` + `connect-mongo` | Distributed, persistent session store in MongoDB            |
| **Templating Engine**   | `EJS` (Embedded JavaScript)         | Dynamic server-rendered HTML views                          |
| **Styling & Layout**    | `Tailwind CSS` + Custom CSS3        | Modern, mobile-first responsive interfaces                  |
| **Cloud Storage**       | `Cloudinary` + `Multer`             | Cloud-hosted permanent image uploads with auto-optimization |
| **QR Code Engine**      | `qrcode`                            | Base64 high-error-correction DataURL generator              |
| **Email Dispatch**      | `Nodemailer` + `Resend` / `Brevo`   | Multi-engine mailer for alerts, OTPs, and contact forms     |
| **Security**            | `bcrypt` + `cors` + `connect-flash` | Salted hashing, CORS policies & session flash toasts        |

---

## 🚀 Quick Start / Installation

Follow these steps to run Woffy on your local machine:

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)
- [Cloudinary Account](https://cloudinary.com/) (Free tier for media uploads)
- [Google Cloud Console Project](https://console.cloud.google.com/) (For Google OAuth 2.0 Client ID & Secret)

### 2. Clone the Repository

```bash
git clone https://github.com/git-shubham-side/Woffy-A-Dog-Care-Project.git
cd Woffy
```

### 3. Install Dependencies

You can install all dependencies across the monorepo root, backend, and frontend with a single command:

```bash
npm run install:all
```

Or install them individually:
```bash
npm install                     # Root concurrently runner
cd backend && npm install       # Backend REST API dependencies
cd ../frontend && npm install   # Frontend React dependencies
```

### 4. Configure Backend Environment (`backend/.env`)

Ensure `backend/.env` is configured with your database, Cloudinary, and session keys:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_2026_super_secure
BASE_URL=http://localhost:5000

# MongoDB Database Connection URL
DBURL=mongodb://127.0.0.1:27017/Woffy

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Session Secret Key
SESSION_SECRET=your_session_secret_key

# Admin & Email Service
ADMIN_EMAIL=your_email@gmail.com
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

### 5. Running the Application

#### A. Run Both Frontend and Backend Concurrently (Recommended)
From the root directory:
```bash
npm run dev
```
- **Backend API**: `http://localhost:5000`
- **React Frontend**: `http://localhost:5173`

#### B. Run Independently
To run only the Backend API:
```bash
npm run dev:backend
```

To run only the React Frontend:
```bash
npm run dev:frontend
```

#### C. Production Build
```bash
npm run build
```

### 6. (Optional) Seed Sample Data

Initialize default hospitals, rescue shelters, products, and admin accounts:

```bash
node backend/src/Database/seedPlatform.js
node backend/src/Database/seedHospitals.js
node backend/src/Database/seedAdmin.js
```

- **Development Mode (with live reload):**
  ```bash
  npm run dev
  ```
- **Production Mode:**
  ```bash
  npm start
  ```

Open your browser and visit:
- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`

---

## 📡 API & Route Endpoints

### 🔐 Authentication & Account

| Method       | Endpoint                 | Description                                 | Auth Required |
| :----------- | :----------------------- | :------------------------------------------ | :-----------: |
| `GET / POST` | `/signup`                | Register a new pet parent account           |      ❌       |
| `GET / POST` | `/login`                 | Log in and initialize session               |      ❌       |
| `GET`        | `/auth/google`           | Initiate Google OAuth 2.0 Sign-in / Sign-up |      ❌       |
| `GET`        | `/auth/google/callback`  | Google OAuth 2.0 verification callback      |      ❌       |
| `GET`        | `/logout`                | Destroy active session and log out          |      ✅       |
| `GET / POST` | `/forgot-password`       | Request password reset email / OTP          |      ❌       |
| `GET / POST` | `/reset-password/:token` | Reset password using 1-Click Magic Link     |      ❌       |
| `GET / POST` | `/verify-reset-otp`      | Verify 6-digit OTP and reset password       |      ❌       |
| `GET`        | `/terms`                 | View Terms of Service & Privacy Policy      |      ❌       |

### 🐶 Pet Profiles & Emergency Tags

| Method       | Endpoint                              | Description                                   | Auth Required |
| :----------- | :------------------------------------ | :-------------------------------------------- | :-----------: |
| `GET`        | `/dashboard`                          | User dashboard with pet vitals and due alerts |      ✅       |
| `GET / POST` | `/api/create-pet-profile`             | Create new pet profile with image uploads     |      ✅       |
| `GET`        | `/api/pet-profiles`                   | View list of all user's registered pets       |      ✅       |
| `GET`        | `/api/pet-profile/:petId`             | Detailed pet profile & health records         |      ✅       |
| `GET / POST` | `/api/pet-profile/edit/:petId`        | Edit pet vitals, photos, and emergency info   |      ✅       |
| `POST`       | `/api/pet-profile/:petId/toggle-lost` | 1-Click Toggle Lost Dog SOS alert             |      ✅       |
| `GET`        | `/api/pet-profile/:petId/print-tag`   | Printable collar QR tag & wallet card sheet   |      ✅       |
| `POST`       | `/api/pet-profile/delete/:petId`      | Delete a pet profile and associated records   |      ✅       |
| `GET`        | `/pet/tag/:id`                        | **Public Emergency QR Tag Scan View**         |      ❌       |

### 💉 WSAVA Vaccination & Deworming Hub

| Method | Endpoint                             | Description                                      | Auth Required |
| :----- | :----------------------------------- | :----------------------------------------------- | :-----------: |
| `GET`  | `/vaccinations/:petId`               | View full vaccination tracker & schedule         |      ✅       |
| `POST` | `/vaccinations/:petId/generate`      | Auto-populate / regenerate WSAVA schedule        |      ✅       |
| `POST` | `/vaccinations/:petId/add`           | Add a custom immunization entry                  |      ✅       |
| `POST` | `/vaccinations/complete/:id`         | Mark vaccine completed + upload certificate      |      ✅       |
| `POST` | `/vaccinations/update/:id`           | Edit vaccine entry details                       |      ✅       |
| `POST` | `/vaccinations/delete/:id`           | Remove a vaccine record                          |      ✅       |
| `POST` | `/vaccinations/:petId/send-reminder` | Dispatch instant email reminder for due vaccines |      ✅       |
| `GET`  | `/vaccinations/print/:petId`         | View & print official Pet Vaccination Passport   |      ✅       |

### 📋 Health & Activity Tracking

| Method | Endpoint                        | Description                                 | Auth Required |
| :----- | :------------------------------ | :------------------------------------------ | :-----------: |
| `GET`  | `/api/select-pet-for-tracking`  | Select pet to create activity / medical log |      ✅       |
| `GET`  | `/api/track/:petId`             | Activity log creation form & recent logs    |      ✅       |
| `POST` | `/api/track/create`             | Save new log entry (meals, walks, symptoms) |      ✅       |
| `GET`  | `/api/show-records/:petId`      | View complete filterable health history     |      ✅       |
| `POST` | `/api/records/delete/:recordId` | Delete an activity log record               |      ✅       |

### 🏥 Veterinary Hospitals, Rescue & Shop

| Method       | Endpoint                  | Description                                     | Auth Required |
| :----------- | :------------------------ | :---------------------------------------------- | :-----------: |
| `GET`        | `/services/hospitals`     | Search verified veterinary clinics & hospitals  |      ❌       |
| `GET / POST` | `/services/hospitals/add` | Submit a new hospital for administrative review |    ❌ / ✅    |
| `GET`        | `/services/rescue`        | Directory of 24/7 rescue shelters & ambulances  |      ❌       |
| `GET`        | `/shop`                   | Browse curated pet food, supplies & toys        |      ❌       |
| `GET / POST` | `/products/list-product`  | Submit a product listing request                |      ✅       |
| `POST`       | `/contact`                | Send inquiry / contact message to admin         |      ❌       |

### 🛡️ Admin Portal (`/admin`)

| Method | Endpoint                           | Description                                       | Auth Required |
| :----- | :--------------------------------- | :------------------------------------------------ | :-----------: |
| `GET`  | `/admin/dashboard`                 | Main admin overview (Hospitals, Products, Rescue) |   👑 Admin    |
| `POST` | `/admin/hospitals/approve/:id`     | Approve submitted hospital listing                |   👑 Admin    |
| `POST` | `/admin/hospitals/reject/:id`      | Reject submitted hospital listing                 |   👑 Admin    |
| `POST` | `/admin/hospitals/delete/:id`      | Delete hospital entry                             |   👑 Admin    |
| `POST` | `/admin/products/add`              | Add new product to shop catalog                   |   👑 Admin    |
| `POST` | `/admin/products/toggle-stock/:id` | Toggle in-stock / out-of-stock badge              |   👑 Admin    |
| `POST` | `/admin/rescue/add`                | Add new animal rescue service organization        |   👑 Admin    |

---

## ⚙️ Environment Variables

| Variable                | Required | Description                                                          | Example                                      |
| :---------------------- | :------: | :------------------------------------------------------------------- | :------------------------------------------- |
| `PORT`                  |    No    | Port on which the HTTP server listens (defaults to `3000`)           | `3000`                                       |
| `NODE_ENV`              |    No    | Application environment (`development` or `production`)              | `production`                                 |
| `BASE_URL`              | **Yes**  | Fully qualified public URL (used for QR tags & email reset links)    | `https://woffy.up.railway.app`               |
| `DBURL`                 | **Yes**  | MongoDB connection string (Atlas URI or local connection)            | `mongodb+srv://...`                          |
| `SESSION_SECRET`        | **Yes**  | Secret key for signing session cookies                               | `random_32_character_string`                 |
| `CLOUDINARY_CLOUD_NAME` | **Yes**  | Cloudinary cloud identifier for image storage                        | `my_cloud_name`                              |
| `CLOUDINARY_API_KEY`    | **Yes**  | Cloudinary API Key                                                   | `1234567890`                                 |
| `CLOUDINARY_API_SECRET` | **Yes**  | Cloudinary API Secret                                                | `abCdEfGhIjKlMnOp`                           |
| `ADMIN_EMAIL`           | **Yes**  | Email recipient for contact submissions and admin alerts             | `admin@woffy.com`                            |
| `EMAIL_USER`            | **Yes**  | SMTP / Gmail sender email address                                    | `mailer@woffy.com`                           |
| `EMAIL_PASS`            | **Yes**  | SMTP password or Google App Password (16 chars)                      | `abcd efgh ijkl mnop`                        |
| `RESEND_API_KEY`        | Optional | API key for high-speed Resend transactional email API                | `re_12345678`                                |
| `GOOGLE_CLIENT_ID`      | Optional | Google OAuth 2.0 Client ID for Social Sign-In                        | `xxx.apps.googleusercontent.com`             |
| `GOOGLE_CLIENT_SECRET`  | Optional | Google OAuth 2.0 Client Secret                                       | `GOCSPX-xxx`                                 |
| `GOOGLE_CALLBACK_URL`   | Optional | OAuth 2.0 Authorized Redirect URI (default: `/auth/google/callback`) | `http://localhost:3000/auth/google/callback` |

---

## 🚢 Deployment

Woffy is configured with `trust proxy` enabled and is ready for 1-click deployment on modern cloud platforms:

### Deploying to Railway / Render:

1. Push your code to your GitHub repository.
2. Link the repository on **[Railway](https://railway.app)** or **[Render](https://render.com)**.
3. In the platform dashboard, set your **Build Command** to `npm install` and **Start Command** to `npm start`.
4. Add all environment variables listed in the [Environment Variables](#%EF%B8%8F-environment-variables) section.
5. Set `BASE_URL` to your assigned custom domain or Railway/Render URL (e.g., `https://woffy.up.railway.app`).
6. Deploy! 🚀

---

## 👨‍💻 Author & Maintainer

**Shubham Rathod (Jimmy)**

- GitHub: [@git-shubham-side](https://github.com/git-shubham-side)
- Repository: [Woffy - A Dog Care Project](https://github.com/git-shubham-side/Woffy-A-Dog-Care-Project)

---

## 📄 License

This project is licensed under the [ISC License](LICENSE). Feel free to use, modify, and contribute!

<div align="center">
  <sub>Built with ❤️ for dogs and animal lovers everywhere.</sub>
</div>
