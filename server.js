// Imports
import express from "express";

// Constants
const app = express();
const name = process.env.NAME || "NAME NOT SET";
const PORT = process.env.PORT || 3000;

// Define a route handler for the root URL ('/')
app.get("/", (req, res) => {
  res.send(`Hello, ${name}!`);
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on http://127.0.0.1:${PORT}`);
});