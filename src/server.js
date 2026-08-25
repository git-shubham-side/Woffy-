require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("node:path");

const app = express();
const PORT = process.env.PORT;

app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

//Database
const dbConnection = require("./Database/db");
dbConnection();

app.get("/test", (req, res) => {});

// Routes
app.get("/", (req, res) => {
  res.render("Landing/index");
});

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", uptime: process.uptime() });
});

// Routes

//Signup
app.get("/api/signup", (req, res) => {
  res.render("Signup/signup");
});
app.post("/api/singup", (req, res) => {
  console.log(req.body);
  res.json({ msg: "ok" });
});

//Login
app.get("/api/login", (req, res) => {
  res.render("Login/login");
});
app.post("/api/login", (req, res) => {
  console.log(req.body);
  res.json({ msg: "ok" });
});

app.get("/api/dashboard", (req, res) => {
  res.render("Dashboard/dashboard");
});

// ------------ Pet Profile Creation ---------------||
app.get("/api/create-pet-profile", (req, res) => {
  res.render("Profile-Creation/create-profile");
});

//------------ View Profile Route ------------||

app.get("/api/pet-profile", (req, res) => {
  res.render("Pet-Profile/Profile");
});

//-----------Show User Pet Profiles ---------||
app.get("/api/pet-profiles", (req, res) => {
  res.render("My-Pets/my-pets");
});

//------- Select Pet record Type  -------
app.get("/api/select-pet-for-tracking", (req, res) => {
  res.render("Select-pets-for-tracking/pet-tracking");
});

//-----Form Pet For Tracking --------
app.get("/api/petId", (req, res) => {
  res.render("Track-Record-Form/track-record-form");
});

//---------- Select Pet to Show Record - Form Dashboard
app.get("/api/select-pet-to-show-record", (req, res) => {
  res.render("Select-Pet-to-show-Record/select-pet-to-show-record");
});

//---------Show PET Records ---------
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
