require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("node:path");
const session = require("express-session");
const flash = require("connect-flash");
const MongoStore = require("connect-mongo").default;

// Route Imports
const pageRoutes = require("./Routes/pageRoutes");
const authRoutes = require("./Routes/authRoutes");
const petRoutes = require("./Routes/petRoutes");
const recordRoutes = require("./Routes/recordRoutes");
const vaccinationRoutes = require("./Routes/vaccinationRoutes");
const contactRoutes = require("./Routes/contactRoutes");
const hospitalRoutes = require("./Routes/hospitalRoutes");
const adminRoutes = require("./Routes/adminRoutes");
const chatbotRoutes = require("./Routes/chatbotRoutes");
const {
  notFoundHandler,
  globalErrorHandler,
} = require("./Controllers/pageController");
const { verifyToken } = require("./Utils/tokenHelper");

const app = express();

// Trust Reverse Proxy (Required for Render, Heroku, etc.)
app.set("trust proxy", 1);

// View Engine & Static Assets
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// CORS Configuration - Allows Vite React Frontend (port 5173) and production domain
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://localhost:5000",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      return callback(null, true); // Dev and cross-origin friendly
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept", "X-Requested-With"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Session & Flash Configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "woofy_session_secret_key_12345",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.DBURL || "mongodb://127.0.0.1:27017/Woffy",
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
      httpOnly: true,
      secure: "auto",
      sameSite: "lax",
    },
  }),
);
app.use(flash());

const User = require("./Models/User");
const Hospital = require("./Models/Hospital");
const Vaccination = require("./Models/Vaccination");
const ShelterRequest = require("./Models/ShelterRequest");

// Global Flash Messages, User Identification & Token Extraction Middleware
app.use(async (req, res, next) => {
  res.locals.success_msg = req.flash ? req.flash("success") : [];
  res.locals.error_msg = req.flash ? req.flash("error") : [];
  res.locals.isAdminUser = false;
  res.locals.pendingHospitalCount = 0;
  res.locals.pendingShelterCount = 0;
  res.locals.dueVaccineCount = 0;
  res.locals.currentUser = null;

  // 1. Extract Bearer token if provided
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (decoded && decoded.id) {
      req.userId = decoded.id;
    }
  }

  // 2. Fallback to Session
  if (!req.userId && req.session && req.session.userId) {
    req.userId = req.session.userId;
  }

  res.locals.userId = req.userId || null;

  if (req.userId) {
    try {
      const user = await User.findById(req.userId);
      if (user) {
        req.user = user;
        const adminEmail = (
          process.env.ADMIN_EMAIL || "rathodshubham7711@gmail.com"
        )
          .toLowerCase()
          .trim();
        const isCompanyAdmin =
          user.isAdmin === true ||
          user.role === "admin" ||
          user.email.toLowerCase().trim() === adminEmail;
        res.locals.isAdminUser = isCompanyAdmin;
        res.locals.currentUser = user;

        if (isCompanyAdmin) {
          res.locals.pendingHospitalCount = await Hospital.countDocuments({
            status: "pending",
          });
          res.locals.pendingShelterCount = await ShelterRequest.countDocuments({
            status: "pending",
          });
        }

        res.locals.dueVaccineCount = await Vaccination.countDocuments({
          user: req.userId,
          status: { $in: ["Due Soon", "Overdue"] },
        });
      }
    } catch (e) {
      console.warn("User auth verification warning:", e.message);
    }
  }
  next();
});

// Route Mounting: Dedicated API namespace and Root routes for maximum compatibility
app.use("/api/auth", authRoutes);
app.use("/api/pets", petRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/vaccinations", vaccinationRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chat", chatbotRoutes);
app.use("/api/chatbot", chatbotRoutes);

// Root Routes
app.use("/", pageRoutes);
app.use("/", authRoutes);
app.use("/", petRoutes);
app.use("/", recordRoutes);
app.use("/", vaccinationRoutes);
app.use("/", contactRoutes);
app.use("/", hospitalRoutes);
app.use("/admin", adminRoutes);

// Error Handling Middlewares
app.use(notFoundHandler);
app.use(globalErrorHandler);

module.exports = app;
