// Imports
import { getFacultyBySlug, getSortedFaculty } from "../../models/faculty/faculty.js";

// Routes
const facultyListPage = async (req, res) => {
  const sortBy = req.query.sort || "name";
  const sortedFaculty = await getSortedFaculty(sortBy);

  res.render("faculty/list", {
    title: "Faculty Directory",
    faculty: sortedFaculty,
    currentSort: sortBy
  });
};

const facultyDetailPage = async (req, res, next) => {
  // Routes through faculty details
  const facultySlug = req.params.facultySlug;
  const facultyMember = await getFacultyBySlug(facultySlug);

  // Validator
  if (Object.keys(facultyMember).length === 0) {
    const err = new Error(`Faculty member ${facultySlug} not found`);
    err.status = 404;
    return next(err);
  }

  //Development logging
  if (process.env.NODE_ENV === "development") {
    console.log(`Viewing faculty member: ${facultySlug}`);
  }

  res.render("faculty/faculty-detail", {
    title: facultyMember.name,
    faculty: facultyMember,
    facultySlug: facultySlug,
  });
};

// Exports
export { facultyListPage, facultyDetailPage };