// Imports (Core-Middleware-Models)
import { Router } from "express";
import bcrypt from "bcrypt";
import { body, validationResult } from "express-validator";
import { requireLogin } from "../../middleware/auth.js";
import { emailExists, saveUser, getAllUsers } from "../../models/forms/registration.js";

// Constants
const router = Router();

// Validation Middleware and Handler
const registrationValidation = [
	body("name")
		.trim()
		.isLength({ min: 2 })
		.withMessage("Name must be at least 2 characters"),
	body("email")
		.trim()
		.isEmail()
		.normalizeEmail()
		.withMessage("Must be a valid email address"),
	body("emailConfirm")
		.trim()
		.normalizeEmail() //Added normalization to ensure consistent email format for comparison
		.custom((value, { req }) => value === req.body.email)
		.withMessage("Email addresses must match"),
	body("password")
		.isLength({ min: 8 })
		.matches(/[0-9]/)
		.withMessage("Password must contain at least one number")
		.matches(/[!@#$%^&*]/)
		.withMessage("Password must contain at least one special character"),
	body("passwordConfirm")
		.custom((value, { req }) => value === req.body.password)
		.withMessage("Passwords must match")
];

// Routes
const showRegistrationForm = (req, res) => {
	res.render("forms/registration/form", {
		title: "User Registration"
	});
};

// Handle user registration with validation and password hashing.
const processRegistration = async (req, res) => {
	// Check for validation errors
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		// Flash validation errors
		errors.array().forEach((error) => {
			req.flash("error", error.msg);
		});
		return res.redirect("/register");
	}

	// Extract validated data from request body
	const { name, email, password } = req.body;

	try {
		if (await emailExists(email)) {
			// Check if email already exists in database
			req.flash("warning", `Email ${email} already exists`);
			return res.redirect("/register");
		}

		// SECURITY NOTE: Hash the password before saving to database
		const hashedPassword = await bcrypt.hash(password, 10);
		await saveUser(name, email, hashedPassword);
		req.flash("success", `Successfully registered user: ${name} (${email})`);

		return res.redirect("/login");

	} catch (error) {
		console.error("Failed to register user:", error);
		req.flash("error", "An error occurred while registering the user");
		// Redirect back to form without saving
		return res.redirect("/register");
	}
};

// Display all registered users.
const showAllUsers = async (req, res) => {
	// Initialize users as empty array
	let allUsers = [];

	try {
		allUsers = await getAllUsers();
	} catch (error) {
		console.error("Error retrieving users:", error);
		return res.render("forms/registration/list", {
			title: "Registered Users",
			users: []
		});
	}

	return res.render("forms/registration/list", {
		title: "Registered Users",
		users: allUsers
	});
};

// GET routes
router.get("/", showRegistrationForm);
router.get("/list", requireLogin, showAllUsers);

// POST routes
router.post("/", registrationValidation, processRegistration);

export default router;