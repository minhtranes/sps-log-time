function accumulate() {
  var tasks: Task[] = runningTasks();
  if (tasks == null || tasks.length <= 0) {
    console.log("There is no running task");
    return;
  }
  var accStartDate = new Date();
  var accEndDate = new Date();

  accumulateRange(tasks, accStartDate, accEndDate);
}

function accumulateRange(tasks: Task[], accStartDate: Date, accEndDate: Date) {
  var date = accStartDate;
  while (date <= accEndDate) {
    accumulateDay(tasks, date);
    date = DateUtility.addDays(date, 1);
  }
}
function accumulateDay(tasks: Task[], date: Date) {
  var sheet = indicateReportSheet(date);
}
function indicateReportSheet(date: Date): GoogleAppsScript.Spreadsheet.Sheet {
  var sheetName = date.getFullYear + "_" + date.getMonth;
  return sheetFromName(sheetName);
}
