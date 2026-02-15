// Imports
import { getAllCourses, getCourseById } from "../../models/catalog/catalog.js";
import { getSectionsByCourseId } from "../../models/catalog/catalog.js";

// Routes
const catalogPage = async (req, res) => {
  const courses = await getAllCourses();

  res.render("catalog", {
    title: "Course Catalog",
    courses: courses
  });
};

const courseDetailPage = async (req, res, next) => {
  // Routes through course details
  const courseId = req.params.courseId;
  const course = await getCourseById(courseId);

  if (Object.keys(course).length === 0) {
    const err = new Error(`Course ${courseId} not found`);
    err.status = 404;
    return next(err);
  }

  const sortBy = req.query.sort || "time";
  const sections = await getSectionsByCourseId(courseId, sortBy);

  //Development logging
  if (process.env.NODE_ENV === "development") {
    console.log(`Viewing course: ${courseId}, sorted by: ${sortBy}`);
  }

  res.render("course-detail", {
    title: `${course.courseCode} - ${course.name}`,
    course: course,
    sections: sections,
    currentSort: sortBy
  });
};

const randomCoursePage = async (req, res, next) => {
  // Select a random course ID
  const courses = await getAllCourses();
  const ids = courses.map(c => c.courseCode);

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