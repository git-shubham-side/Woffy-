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
const {
  notFoundHandler,
  globalErrorHandler,
} = require("./Controllers/pageController");

const app = express();

// Trust Reverse Proxy (Required for Render, Heroku, etc.)
app.set("trust proxy", 1);

// View Engine & Static Assets
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Core Middlewares
app.use(cors());
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
      secure: "auto", // Automatically detects HTTPS on Render vs HTTP on localhost
      sameSite: "lax",
    },
  }),
);
app.use(flash());

const User = require("./Models/User");
const Hospital = require("./Models/Hospital");
const Vaccination = require("./Models/Vaccination");
const ShelterRequest = require("./Models/ShelterRequest");

// Global Flash Messages, Session User & Notification Badge Middleware
app.use(async (req, res, next) => {
  res.locals.success_msg = req.flash("success");
  res.locals.error_msg = req.flash("error");
  res.locals.userId = req.session ? req.session.userId : null;
  res.locals.isAdminUser = false;
  res.locals.pendingHospitalCount = 0;
  res.locals.pendingShelterCount = 0;
  res.locals.dueVaccineCount = 0;
  res.locals.currentUser = null;

  if (req.session && req.session.userId) {
    try {
      const user = await User.findById(req.session.userId);
      if (user) {
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

        // Count pending / due soon / overdue vaccines for in-app badge notification
        res.locals.dueVaccineCount = await Vaccination.countDocuments({
          user: req.session.userId,
          status: { $in: ["Due Soon", "Overdue"] },
        });
      }
    } catch (e) {
      console.warn("Session user check warning:", e.message);
    }
  }
  next();
});

// Route Mounting
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
