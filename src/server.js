require("dotenv").config();
const app = require("./app");
const dbConnection = require("./Database/db");

const PORT = process.env.PORT || 3000;

// Initialize MongoDB Database Connection
dbConnection();

// Start HTTP Server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Woofy Server running on http://localhost:${PORT}`);
});
