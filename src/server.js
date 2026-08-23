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

// Routes
app.get("/", (req, res) => {
  res.render("Landing/index");
});

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", uptime: process.uptime() });
});

app.get("/test", (req, res) => {
  res.render("My-Pets/my-pets");
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

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
