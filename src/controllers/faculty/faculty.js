// Imports
import { getFacultyById, getSortedFaculty } from "../../models/faculty/faculty.js";

// Routes
const facultyListPage = (req, res) => {
  const sortBy = req.query.sort || "name";
  const sortedFaculty = getSortedFaculty(sortBy);

  res.render("faculty/list", {
    title: "Faculty Directory",
    faculty: sortedFaculty,
    currentSort: sortBy
  });
};

const facultyDetailPage = (req, res, next) => {
  // Routes through faculty details
  const facultyId = req.params.facultyId;
  const facultyMember = getFacultyById(facultyId);

  // Validator
  if (!facultyMember) {
    const err = new Error(`Faculty member ${facultyId} not found`);
    err.status = 404;
    return next(err);
  }

  //Development logging
  if (process.env.NODE_ENV === "development") {
    console.log(`Viewing faculty member: ${facultyId}`);
  }

  res.render("faculty/detail", {
    title: facultyMember.name,
    faculty: facultyMember,
    facultyId: facultyId,
  });
};

// Exports
export { facultyListPage, facultyDetailPage };