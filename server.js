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
const NODE_ENV = process.env.NODE_ENV || "production";

// Course Data (substitute for a database)
const courses = {
	"CS121": {
		id: "CS121",
		title: "Introduction to Programming",
		description: "Learn programming fundamentals using JavaScript and basic web development concepts.",
		credits: 3,
		sections: [
			{ time: "9:00 AM", room: "STC 392", professor: "Brother Jack" },
			{ time: "2:00 PM", room: "STC 394", professor: "Sister Enkey" },
			{ time: "11:00 AM", room: "STC 390", professor: "Brother Keers" }
		]
	},
	"MATH110": {
		id: "MATH110",
		title: "College Algebra",
		description: "Fundamental algebraic concepts including functions, graphing, and problem solving.",
		credits: 4,
		sections: [
			{ time: "8:00 AM", room: "MC 301", professor: "Sister Anderson" },
			{ time: "1:00 PM", room: "MC 305", professor: "Brother Miller" },
			{ time: "3:00 PM", room: "MC 307", professor: "Brother Thompson" }
		]
	},
	"ENG101": {
		id: "ENG101",
		title: "Academic Writing",
		description: "Develop writing skills for academic and professional communication.",
		credits: 3,
		sections: [
			{ time: "10:00 AM", room: "GEB 201", professor: "Sister Anderson" },
			{ time: "12:00 PM", room: "GEB 205", professor: "Brother Davis" },
			{ time: "4:00 PM", room: "GEB 203", professor: "Sister Enkey" }
		]
	}
};

// Middleware (AKA Mise en Place)
// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views"));

app.use((req, res, next) => {
	// Make NODE_ENV available to all templates
	res.locals.NODE_ENV = NODE_ENV.toLowerCase() || "production";
	next();
});

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
app.get("/catalog", (req, res) => {
	res.render("catalog", {
		title: "Course Catalog",
		activePage: "catalog",
		courses: courses
	});
});
app.get("/catalog/random", (req, res, next) => {
	const ids = Object.keys(courses);

	// Validator
	if (ids.length === 0) {
		const err = new Error("No courses available");
		err.status = 500;
		return next(err);
	}

	let randomId = ids[Math.floor(Math.random() * ids.length)];
	res.redirect(`/catalog/${randomId}`);
});
// Enhanced course detail route with sorting
app.get("/catalog/:courseId", (req, res, next) => {
	const courseId = req.params.courseId;
	const validPattern = /^[A-Za-z]+[0-9]+$/;
	const sortBy = req.query.sort || "time";
	const course = courses[courseId];

	// Validators
	if (!validPattern.test(courseId)) {
		const err = new Error(`Invalid course ID format: ${courseId}`);
		err.status = 404;
		return next(err);
	} else if (!course) {
		const err = new Error(`Course ${courseId} not found`);
		err.status = 404;
		return next(err);
	}

	let sortedSections = [...course.sections];

	// Sort based on the parameter
	switch (sortBy) {
		case "professor":
			sortedSections.sort((a, b) => a.professor.localeCompare(b.professor));
			break;
		case "room":
			sortedSections.sort((a, b) => a.room.localeCompare(b.room));
			break;
		case "time":
		default:
			// Keep original time order as default
			break;
	}

	console.log(`Viewing course: ${courseId}, sorted by: ${sortBy}`);

	res.render("course-detail", {
		title: `${course.id} - ${course.title}`,
		activePage: "catalog",
		course: { ...course, sections: sortedSections },
		currentSort: sortBy
	});
});

// Error Handling Middleware
// Test route for 500 errors
app.get("/test-error", (req, res, next) => {
	const err = new Error("This is a test error");
	err.status = 500;
	next(err);
});

app.get("/test-unexerr", (req, res, next) => {
	const err = new Error("This is an unexpected test error");
	err.status = 418; // Potato error
	next(err);
});

// Catch-all route for 404 errors
app.use((req, res, next) => {
	const err = new Error("Page Not Found");
	err.status = 404;
	next(err);
});

// Global error handler
app.use((err, req, res, next) => {
	// Prevent infinite loops, if a response has already been sent, do nothing
	if (res.headersSent || res.finished) {
		return next(err);
	}

	const status = err.status || 500;
	let template = status === 404 ? "404" : status === 500 ? "500" : "error";

	// Prepare data for the template
	const context = {
		title: status === 404 ? "Page Not Found" : status === 500 ? "Server Error" : "Unexpected Error",
		error: NODE_ENV === "production" ? "An error occurred" : err.message,
		stack: NODE_ENV === "production" ? null : err.stack,
		NODE_ENV,
		activePage: null
	};

	// Render the appropriate error template with fallback
	try {
		res.status(status).render(`errors/${template}`, context);
	} catch (renderErr) { // eslint-disable-line no-unused-vars
		if (!res.headersSent) {
			res.status(status).send(`<h1>Error ${status}</h1><p>An error occurred.</p>`);
		}
	}
});

// When in development mode, start a WebSocket server for live reloading
if (NODE_ENV.includes("dev")) {
	const ws = await import("ws");

	try {
		const wsPort = parseInt(PORT) + 1;
		const wsServer = new ws.WebSocketServer({ port: wsPort });

		wsServer.on("listening", () => {
			console.log(`WebSocket server is running on port ${wsPort}`);
		});

		wsServer.on("error", (error) => {
			console.error("WebSocket server error:", error);
		});
	} catch (error) {
		console.error("Failed to start WebSocket server:", error);
	}
}

// Start the server and listen on the specified port
app.listen(PORT, () => {
	console.log(`Server is running on http://127.0.0.1:${PORT}`);
});