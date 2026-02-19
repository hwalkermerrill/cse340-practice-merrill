// Imports
import { Router } from "express";
import { addDemoHeaders } from "../middleware/demo/headers.js";
import { catalogPage, courseDetailPage, randomCoursePage } from "./catalog/catalog.js";
import { facultyListPage, facultyDetailPage } from "./faculty/faculty.js";
import { homePage, aboutPage, demoPage, testErrorPage, testUnexpectedError, testNotLoggedInError, testForbiddenError } from "./index.js";

// Constants
const router = Router();

// Router-level Middleware
router.use("/catalog", (req, res, next) => {
  // Add catalog-specific styles to all catalog routes
  res.addStyle("<link rel=\"stylesheet\" href=\"/css/catalog.css\">");
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

// Development Only Routes
if (process.env.NODE_ENV === "development") {
  router.get("/test-error", testErrorPage);
  router.get("/test-unexpected", testUnexpectedError);
  router.get("/test-logged", testNotLoggedInError);
  router.get("/test-forbidden", testForbiddenError);
}

export default router;