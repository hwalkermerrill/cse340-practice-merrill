// Imports
import express from "express";
import { fileURLToPath } from "url";
import path from "path";
import routes from "./src/controllers/routes.js";
import { addLocalVariables, devLogs } from "./src/middleware/global.js";
import { error404Router, globalErrorHandler } from "./src/middleware/errorHandler.js";
import { setupDatabase, testConnection } from "./src/models/setup.js";

// Constants
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV?.toLowerCase() || "production";

// App Configuration
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Middleware (AKA Mise en Place)
app.use(addLocalVariables);

if (process.env.NODE_ENV === "development") {
	app.use(devLogs);
}

// Routes
app.use("/", routes);

// Error Handling
app.use(error404Router);
app.use(globalErrorHandler);

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
app.listen(PORT, async () => {
	await setupDatabase();
	await testConnection();
	console.log(`Server is running on http://127.0.0.1:${PORT}`);
});