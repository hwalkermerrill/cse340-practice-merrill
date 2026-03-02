// Imports
import { Router } from "express";
import { addDemoHeaders } from "../middleware/demo/headers.js";
import { catalogPage, courseDetailPage, randomCoursePage } from "./catalog/catalog.js";
import { facultyListPage, facultyDetailPage } from "./faculty/faculty.js";
import { homePage, aboutPage, demoPage, testErrorPage, testUnexpectedError, testNotLoggedInError, testForbiddenError } from "./index.js";
import contactRoutes from "./forms/contact.js";
import registrationRoutes from "./forms/registration.js";

// Constants
const router = Router();

// Router-level Middleware
router.use("/catalog", (req, res, next) => {
  res.addStyle("<link rel=\"stylesheet\" href=\"/css/catalog.css\">");
  next();
});
router.use("/faculty", (req, res, next) => {
  res.addStyle("<link rel=\"stylesheet\" href=\"/css/faculty.css\">");
  next();
});
router.use("/contact", (req, res, next) => {
  res.addStyle("<link rel=\"stylesheet\" href=\"/css/contact.css\">");
  next();
});
router.use("/register", (req, res, next) => {
  res.addStyle("<link rel=\"stylesheet\" href=\"/css/registration.css\">");
  next();
});

// Routes
router.get("/", homePage);
router.get("/about", aboutPage);
router.get("/catalog", catalogPage);
router.get("/catalog/random", randomCoursePage);
router.get("/catalog/:slugId", courseDetailPage);
router.get("/demo", addDemoHeaders, demoPage);
router.get("/faculty", facultyListPage);
router.get("/faculty/:facultySlug", facultyDetailPage);

// Mounted Sub-Routers
router.use("/contact", contactRoutes);
router.use("/register", registrationRoutes);

// Development Only Routes
if (process.env.NODE_ENV === "development") {
  router.get("/test-error", testErrorPage);
  router.get("/test-unexpected", testUnexpectedError);
  router.get("/test-logged", testNotLoggedInError);
  router.get("/test-forbidden", testForbiddenError);
}

export default router;