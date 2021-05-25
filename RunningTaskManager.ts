function saveTask() {
  var spreadSheet: GoogleAppsScript.Spreadsheet.Spreadsheet =
    SpreadsheetApp.getActive();
  var summary: string = spreadSheet
    .getRange(TaskManagerConfig.valueColumnName + TaskManagerConfig.summaryRow)
    .getValue();
  var startDate: Date = spreadSheet
    .getRange(
      TaskManagerConfig.valueColumnName + TaskManagerConfig.startDateRow
    )
    .getValue();
  var endDate: Date = spreadSheet
    .getRange(TaskManagerConfig.valueColumnName + TaskManagerConfig.endDateRow)
    .getValue();
  if (endDate == null) {
    endDate = DateUtility.addDays(startDate, 20);
  }
  var hourPerDay: number = spreadSheet
    .getRange(
      TaskManagerConfig.valueColumnName + TaskManagerConfig.hourPerDayRow
    )
    .getValue();

  writeTask(summary, startDate, endDate, hourPerDay);
}
function writeTask(
  summary: string,
  startDate: Date,
  endDate: Date,
  hourPerDay: number
) {
  var spreadSheet: GoogleAppsScript.Spreadsheet.Spreadsheet =
    SpreadsheetApp.getActive();
  var r = detectWritingRow(spreadSheet, summary);
  spreadSheet
    .getRange(RunningTasksConfig.summaryColumnName + r)
    .setValue(summary);
  spreadSheet
    .getRange(RunningTasksConfig.startDateColumnName + r)
    .setValue(startDate);
  spreadSheet
    .getRange(RunningTasksConfig.endDateColumnName + r)
    .setValue(endDate);
  spreadSheet
    .getRange(RunningTasksConfig.hourPerDayColumnName + r)
    .setValue(hourPerDay);
}
function detectWritingRow(
  spreadSheet: GoogleAppsScript.Spreadsheet.Spreadsheet,
  summary: string
): number {
  var r = RunningTasksConfig.startRow - 1;
  do {
    r++;
    var v = spreadSheet
      .getRange(RunningTasksConfig.summaryColumnName + r)
      .getValue();
  } while (v == null || v == "" || v == summary);
  return r;
}
