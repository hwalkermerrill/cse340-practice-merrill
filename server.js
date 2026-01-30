// Imports
import express from "express";
import { fileURLToPath } from "url";
import path from "path";

// Constants
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// const name = process.env.NAME || "NAME NOT SET";
const PORT = process.env.PORT || 3000;

// Middleware
// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "src/views/home.html"));
});
app.get("/about", (req, res) => {
	res.sendFile(path.join(__dirname, "src/views/about.html"));
});
app.get("/products", (req, res) => {
	res.sendFile(path.join(__dirname, "src/views/products.html"));
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
	console.log(`Server is running on http://127.0.0.1:${PORT}`);
});