// Imports
import { getAllCourses, getCourseById, getSortedSections } from "../../models/catalog/catalog.js";

// Routes
const catalogPage = (req, res) => {
  const courses = getAllCourses();

  res.render("catalog/catalog", {
    title: "Course Catalog",
    courses: courses
  });
};

const courseDetailPage = (req, res, next) => {
  // Routes through course details
  const courseId = req.params.courseId;
  const course = getCourseById(courseId);
  const validPattern = /^[A-Za-z]+[0-9]+$/;
  const sortBy = req.query.sort || "time";
  const sortedSections = getSortedSections(course.sections, sortBy);

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

  //Development logging
  if (process.env.NODE_ENV === "development") {
    console.log(`Viewing course: ${courseId}, sorted by: ${sortBy}`);
  }

  res.render("catalog/course-detail", {
    title: `${course.id} - ${course.title}`,
    course: { ...course, sections: sortedSections },
    currentSort: sortBy
  });
};

const randomCoursePage = (req, res, next) => {
  // Select a random course ID
  const courses = getAllCourses();
  const ids = Object.keys(courses);

  // Validator
  if (ids.length === 0) {
    const err = new Error("No courses available");
    err.status = 500;
    return next(err);
  }

  let randomId = ids[Math.floor(Math.random() * ids.length)];
  res.redirect(`/catalog/${randomId}`);
};

export { catalogPage, courseDetailPage, randomCoursePage };