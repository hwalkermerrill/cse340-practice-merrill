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
const NODE_ENV = process.env.NODE_ENV || "production"; // eslint-disable-line no-unused-vars

// Middleware (AKA Mise en Place)
// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views"));

// Routes
app.get("/", (req, res) => {
	res.render("home", {
		title: "Welcome Home",
		activePage: "home"
	});
});
app.get("/about", (req, res) => {
	res.render("about", {
		title: "About Me",
		activePage: "about"
	});
});
app.get("/products", (req, res) => {
	res.render("products", {
		title: "Our Products",
		activePage: "products"
	});
});

// Render EJS template example (commented out)
// // Define a route for the root URL ('/')
// app.get("/", (req, res) => {
// 	// Create a user object with some sample data
// 	const user = {
// 		name: "Alex",
// 		isLoggedIn: true,
// 		messages: ["Welcome!", "Do not forget to check your inbox."]
// 	};
// 	// Render the 'index' EJS template and pass the user object to it
// 	res.render("index", { user });
// });

// Start the server and listen on the specified port
app.listen(PORT, () => {
	console.log(`Server is running on http://127.0.0.1:${PORT}`);
});