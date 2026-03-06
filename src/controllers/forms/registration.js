// Imports (Core-Middleware-Models)
import { Router } from "express";
import bcrypt from "bcrypt";
import { body, validationResult } from "express-validator";
import { requireLogin } from "../../middleware/auth.js";
import { emailExists, saveUser, getAllUsers, getUserById, updateUser, deleteUser } from "../../models/forms/registration.js";

// Constants
const router = Router();

// Validation Middleware and Handlers
const registrationValidation = [
	body("name")
		.trim()
		.isLength({ min: 2, max: 100 })
		.withMessage("Name must be at least 2 characters and no more than 100 characters")
		.matches(/^[a-zA-Z\s'-]+$/)
		.withMessage("Name can only contain letters, spaces, hyphens, and apostrophes'"),
	body("email")
		.trim()
		.isEmail()
		.normalizeEmail()
		.withMessage("Must be a valid email address")
		.isLength({ max: 255 })
		.withMessage("Email address is too long"),
	body("emailConfirm")
		.trim()
		.normalizeEmail()
		.custom((value, { req }) => value === req.body.email)
		.withMessage("Email addresses must match"),
	body("password")
		.trim()
		.isLength({ min: 8 })
		.withMessage("Password must be at least 8 characters")
		.isLength({ max: 128 })
		.withMessage("Password must be less than 129 characters")
		.matches(/[0-9]/)
		.withMessage("Password must contain at least one number")
		.matches(/[a-z]/)
		.withMessage("Password must contain at least one lowercase letter")
		.matches(/[A-Z]/)
		.withMessage("Password must contain at least one uppercase letter")
		.matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/) // eslint-disable-line no-useless-escape
		.withMessage("Password must contain at least one special character"),
	body("passwordConfirm")
		.trim()
		.custom((value, { req }) => value === req.body.password)
		.withMessage("Passwords must match")
];

const editValidation = [
	body("name")
		.trim()
		.isLength({ min: 2, max: 100 })
		.withMessage("Name must be between 2 and 100 characters")
		.matches(/^[a-zA-Z\s'-]+$/)
		.withMessage("Name can only contain letters, spaces, hyphens, and apostrophes"),
	body("email")
		.trim()
		.isEmail()
		.normalizeEmail()
		.withMessage("Must be a valid email address")
		.isLength({ max: 255 })
		.withMessage("Email address is too long")
];

const showEditAccountForm = async (req, res) => {
	// Allow editing of existing accounts
	const targetUserId = parseInt(req.params.id);
	const currentUser = req.session.user;

	const targetUser = await getUserById(targetUserId);

	if (!targetUser) {
		req.flash("error", "User not found.");
		return res.redirect("/register/list");
	}

	// Check permissions: users can edit themselves, admins can edit anyone
	const canEdit = currentUser.id === targetUserId || currentUser.roleName === "admin";

	if (!canEdit) {
		req.flash("error", "You do not have permission to edit this account.");
		return res.redirect("/register/list");
	}

	res.render("forms/registration/edit", {
		title: "Edit Account",
		user: targetUser
	});
};

const processEditAccount = async (req, res) => {
	// Process account edit form submission
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		errors.array().forEach(error => {
			req.flash("error", error.msg);
		});
		return res.redirect(`/register/${req.params.id}/edit`);
	}

	const targetUserId = parseInt(req.params.id);
	const currentUser = req.session.user;
	const { name, email } = req.body;

	try {
		const targetUser = await getUserById(targetUserId);

		if (!targetUser) {
			req.flash("error", "User not found.");
			return res.redirect("/register/list");
		}

		// Check permissions
		const canEdit = currentUser.id === targetUserId || currentUser.roleName === "admin";

		if (!canEdit) {
			req.flash("error", "You do not have permission to edit this account.");
			return res.redirect("/register/list");
		}

		// Check if new email already exists (and belongs to different user)
		const emailTaken = await emailExists(email);
		if (emailTaken && targetUser.email !== email) {
			req.flash("error", "An account with this email already exists.");
			return res.redirect(`/register/${targetUserId}/edit`);
		}

		// Update the user
		await updateUser(targetUserId, name, email);

		// If user edited their own account, update session
		if (currentUser.id === targetUserId) {
			req.session.user.name = name;
			req.session.user.email = email;
		}

		req.flash("success", "Account updated successfully.");
		res.redirect("/register/list");
	} catch (error) {
		console.error("Error updating account:", error);
		req.flash("error", "An error occurred while updating the account.");
		res.redirect(`/register/${targetUserId}/edit`);
	}
};

const processDeleteAccount = async (req, res) => {
	// Only admin's can delete accounts, and they cannot delete themselves
	const targetUserId = parseInt(req.params.id);
	const currentUser = req.session.user;
	// Only admins can delete accounts
	if (currentUser.roleName !== "admin") {
		req.flash("error", "You do not have permission to delete accounts.");
		return res.redirect("/register/list");
	}
	// Prevent admins from deleting their own account
	if (currentUser.id === targetUserId) {
		req.flash("error", "You cannot delete your own account.");
		return res.redirect("/register/list");
	}
	try {
		const deleted = await deleteUser(targetUserId);
		if (deleted) {
			req.flash("success", "User account deleted successfully.");
		} else {
			req.flash("error", "User not found or already deleted.");
		}
	} catch (error) {
		console.error("Error deleting user:", error);
		req.flash("error", "An error occurred while deleting the account.");
	}
	res.redirect("/register/list");
};

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
router.get("/:id/edit", requireLogin, showEditAccountForm);

// POST routes
router.post("/", registrationValidation, processRegistration);
router.post("/:id/edit", requireLogin, editValidation, processEditAccount);
router.post("/:id/delete", requireLogin, processDeleteAccount);

export default router;