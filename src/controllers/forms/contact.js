// Imports
import { Router } from "express";
import { body, validationResult } from "express-validator";
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
    // Log validation errors for developer debugging
    console.error("Validation errors:", errors.array());
    // Redirect back to form without saving
    return res.redirect("/contact");
  }

  // Extract validated data
  const { subject, message } = req.body;

  try {
    // Save to database
    await createContactForm(subject, message);
    console.log("Contact form submitted successfully");
    // Redirect to responses page on success
    res.redirect("/contact/responses");
  } catch (error) {
    console.error("Error saving contact form:", error);
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
  }

  res.render("forms/contact/responses", {
    title: "Contact Form Submissions",
    contactForms
  });
};

// GET Routes
router.get("/", showContactForm);
router.get("/responses", showContactResponses);

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