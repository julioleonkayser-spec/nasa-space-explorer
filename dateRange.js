// dateRange.js
// Sets the dates the user can pick: June 16, 1995 (first APOD) until today.

var firstDate = "1995-06-16";

// turn a Date into yyyy-mm-dd (the format the date inputs use)
function formatDate(date) {
  var year = date.getFullYear();
  var month = String(date.getMonth() + 1).padStart(2, "0");
  var day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

function setupDateInputs(startInput, endInput) {
  var today = new Date();
  var todayText = formatDate(today);

  startInput.min = firstDate;
  startInput.max = todayText;
  endInput.min = firstDate;
  endInput.max = todayText;

  // start with the last 9 days (ends yesterday, because today's picture may not be out yet)
  var end = new Date();
  end.setDate(end.getDate() - 1);
  var start = new Date();
  start.setDate(start.getDate() - 9);

  startInput.value = "2025-09-18";
  endInput.value = "2025-10-01";
}
