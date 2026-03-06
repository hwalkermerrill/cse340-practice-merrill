// Imports
import { Router } from "express";
import { body, validationResult } from "express-validator";
import { requireLogin } from "../../middleware/auth.js";
import { createContactForm, getAllContactForms } from "../../models/forms/contact.js";

// Constants
const router = Router();

// Routes
const showContactForm = (req, res) => {
  res.render("forms/contact/form", {
    title: "Contact Us"
  });
};

// Validation Middleware and Handler
const handleContactSubmission = async (req, res) => {
  // Handle all submission logic

  // Validation first - if there are errors, log them and redirect back to form without saving
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Flash validation errors
    errors.array().forEach((error) => {
      req.flash("error", error.msg);
    });
    return res.redirect("/contact");
  }

  // Extract validated data
  const { subject, message } = req.body;

  try {
    // Save to database
    await createContactForm(subject, message);
    req.flash("success", "Contact form submitted successfully");
    // Redirect to responses page on success
    res.redirect("/contact");
  } catch (error) {
    console.error("Error saving contact form:", error);
    req.flash("error", "An error occurred while submitting the contact form");
    res.redirect("/contact");
  }
};

const showContactResponses = async (req, res) => {
  // Display all contact form submissions
  let contactForms = [];

  try {
    contactForms = await getAllContactForms();
  } catch (error) {
    console.error("Error retrieving contact forms:", error);
    req.flash("error", "An error occurred while retrieving contact form submissions");
    res.redirect("/contact");
  }

  res.render("forms/contact/responses", {
    title: "Contact Form Submissions",
    contactForms
  });
};

// GET Routes
router.get("/", showContactForm);
router.get("/responses", requireLogin, showContactResponses);

// POST Routes
router.post("/",
  [
    body("subject")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Subject must be at least 2 characters"),
    body("message")
      .trim()
      .isLength({ min: 10 })
      .withMessage("Message must be at least 10 characters")
  ],
  handleContactSubmission
);

export default router;