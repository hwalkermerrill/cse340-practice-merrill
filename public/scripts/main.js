// Author: Harrison Merrill
// Date: January 2026

// [Start Date and Version Block]
const today = new Date();
const yyyy = today.getFullYear();
const versionIteration = "v1.0."

function writeLongDate() { // eslint-disable-line no-unused-vars
  let dwArray = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  let mmArray = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  let dw = dwArray[today.getDay()];
  let mm = mmArray[today.getMonth()];
  let dd = today.getDate();
  if (dd < 10) { dd = "0" + dd }

  let longDate = `${dw}, ${dd} ${mm} ${yyyy}`;
  document.getElementById("longDate").textContent = longDate;
}

function writeVersionNumber() { // eslint-disable-line no-unused-vars
  let yy = yyyy.toString().slice(2);
  let mn = today.getMonth() + 1;
  if (mn < 10) { mn = "0" + mn }

  let versionNumber = versionIteration + yy + mn;
  document.getElementById("versionNumber").textContent = versionNumber;
}
// [End Date and Version Block]