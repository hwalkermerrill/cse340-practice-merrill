// Imports
import { getAllCourses, getCourseBySlug } from "../../models/catalog/courses.js";
import { getSectionsByCourseSlug } from "../../models/catalog/catalog.js";

// Routes
const catalogPage = async (req, res) => {
  const courses = await getAllCourses();

  res.render("catalog/catalog", {
    title: "Course Catalog",
    courses: courses
  });
};

const courseDetailPage = async (req, res, next) => {
  // Routes through course details
  const courseSlug = req.params.slugId;
  const course = await getCourseBySlug(courseSlug);

  if (Object.keys(course).length === 0) {
    const err = new Error(`Course ${courseSlug} not found`);
    err.status = 404;
    return next(err);
  }

  const sortBy = req.query.sort || "time";
  const sections = await getSectionsByCourseSlug(courseSlug, sortBy);

  //Development logging
  if (process.env.NODE_ENV === "development") {
    console.log(`Viewing course: ${courseSlug}, sorted by: ${sortBy}`);
  }

  res.render("catalog/course-detail", {
    title: `${course.courseCode} - ${course.name}`,
    course: course,
    sections: sections,
    currentSort: sortBy
  });
};

const randomCoursePage = async (req, res, next) => {
  // Select a random course Slug
  const courses = await getAllCourses();
  const slugs = courses.map(c => c.slug);

  // Validator
  if (slugs.length === 0) {
    const err = new Error("No courses available");
    err.status = 500;
    return next(err);
  }

  let randomSlug = slugs[Math.floor(Math.random() * slugs.length)];
  res.redirect(`/catalog/${randomSlug}`);
};

export { catalogPage, courseDetailPage, randomCoursePage };