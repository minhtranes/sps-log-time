/**
 * Task is identified by summary and start date
 * Task has a start date and end date (task session)
 * Task is input manually with:
 *    Summary is required
 *    Start date is required
 *    End date is automatically added with 20 days after start day
 * End date could be added manually with value must equal or after start date
 * All running tasks in particular date share 8 hours
 *
 * Scheduler Function (triggered at 01:00 AM ICT each day):
 * Automatically move running tasks forward to current day
 * Divide 8 hours equally to all running tasks
 * Adjust the same date duration bas
 * Delete tasks has end date before or equal execution date (respective boolean argument)
 *
 */
function onOpen(e) {
  SpreadsheetApp.getUi()
    .createMenu("SPS")
    .addItem("Accumulate Yesterday", "accumulateYesterday")
    .addItem("Accumulate Today", "accumulateToday")
    .addItem("Accumulate Last 2 Days", "accumulateLast2Days")
    .addItem("Accumulate Last 3 Days", "accumulateLast3Days")
    .addItem("Accumulate Last 4 Days", "accumulateLast4Days")
    .addItem("Accumulate Last 5 Days", "accumulateLast5Days")
    .addItem("Accumulate This Month !!", "accumulateThisMonth")
    .addItem("Accumulate Tomorrow", "accumulateTomorrow")
    .addItem("Clean Exipred Tasks", "cleanExpiredTask")

    .addToUi();
}

function sheetFromName(sheetName: string): GoogleAppsScript.Spreadsheet.Sheet {
  var spreadSheet: GoogleAppsScript.Spreadsheet.Spreadsheet =
    SpreadsheetApp.getActive();
  var sh = spreadSheet.getSheetByName(sheetName);
  if (sh == null) {
    sh = spreadSheet.insertSheet(sheetName, 3);
  }
  return sh;
}
