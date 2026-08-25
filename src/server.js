require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("node:path");
const bcrypt = require("bcrypt");

const app = express();
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const PORT = process.env.PORT;

app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.DBURL,
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
      secure: false, //-----------True in production
    },
  }),
);

const isAuthenticated = require("./Middlewares/isAuthenticated");

//Database
const dbConnection = require("./Database/db");
dbConnection();

//----DB Models
const User = require("./Models/User");

//-------- TEST ROUTE ------||
// app.get("/test", (req, res) => {});

// Routes
app.get("/", (req, res) => {
  res.render("Landing/index");
});

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", uptime: process.uptime() });
});

// Routes

//------- GET: ----Signup---------------||
app.get("/api/signup", (req, res) => {
  res.render("Signup/signup");
});

//------- POST: ----Signup---------------||
app.post("/api/signup", async (req, res, next) => {
  try {
    console.log(req.body);
    const user = await User.create(req.body);
    req.session.userId = user._id;
    res.redirect("/api/dashboard");
  } catch (err) {
    console.log(err);
    next(err);
  }
});

//------------ GET: -----Login-----------||
app.get("/api/login", (req, res) => {
  res.render("Login/login");
});
//// POST --LOGIN
app.post("/api/login", async (req, res, next) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
    });
    if (!user) {
      return res.redirect("/api/login");
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res.redirect("/api/login");
    }
    req.session.userId = user._id.toString();
    return res.redirect("/api/dashboard");
  } catch (err) {
    next(err);
  }
});

//---------GET: -------Dashboard-------||
app.get("/api/dashboard", isAuthenticated, (req, res) => {
  res.render("Dashboard/dashboard");
});

// ------GET: ------ Pet Profile Creation ---------------||
app.get("/api/create-pet-profile", (req, res) => {
  res.render("Profile-Creation/create-profile");
});

//-------- GET: ---- View Profile Route ------------||

app.get("/api/pet-profile", (req, res) => {
  res.render("Pet-Profile/Profile");
});

//----- GET: ------Show User Pet Profiles ---------||
app.get("/api/pet-profiles", (req, res) => {
  res.render("My-Pets/my-pets");
});

//---- GET: --- Select Pet record Type  -------
app.get("/api/select-pet-for-tracking", (req, res) => {
  res.render("Select-pets-for-tracking/pet-tracking");
});

//--- GET: --Form Pet For Tracking --------
app.get("/api/petId", (req, res) => {
  res.render("Track-Record-Form/track-record-form");
});

//----- GET: ----- Select Pet to Show Record - Form Dashboard
app.get("/api/select-pet-to-show-record", (req, res) => {
  res.render("Select-Pet-to-show-Record/select-pet-to-show-record");
});

//----- GET: ----Show PET Records ---------
app.get("/api/show-records/petID", (req, res) => {
  res.render("View-Record-Pet/view-record");
});

// 404 handler
app.use((req, res) => {
  res.render("Route-Not-Found/route-not-found");
  // res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
