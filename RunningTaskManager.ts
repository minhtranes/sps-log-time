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
  if (endDate == null || endDate == undefined || endDate.toString() == "") {
    endDate = DateUtility.addDays(startDate, 20);
  }
  var hourPerDay: number = spreadSheet
    .getRange(
      TaskManagerConfig.valueColumnName + TaskManagerConfig.hourPerDayRow
    )
    .getValue();
  if (hourPerDay == null || hourPerDay == undefined) {
    hourPerDay = 0;
  }

  writeTask(new Task(summary, startDate, endDate, hourPerDay));
}
function writeTask(task: Task) {
  var spreadSheet: GoogleAppsScript.Spreadsheet.Spreadsheet =
    SpreadsheetApp.getActive();
  var r = detectWritingRow(spreadSheet, task.getSummary());

  spreadSheet
    .getRange(RunningTasksConfig.summaryColumnName + r)
    .setValue(task.getSummary());
  spreadSheet
    .getRange(RunningTasksConfig.startDateColumnName + r)
    .setValue(task.getStartDate());
  spreadSheet
    .getRange(RunningTasksConfig.endDateColumnName + r)
    .setValue(task.getEndDate());
  spreadSheet
    .getRange(RunningTasksConfig.hourPerDayColumnName + r)
    .setValue(task.getHourPerDay());
  console.log(
    "Wrote task [%s, %s, %s, %d] into row [%d]",
    task.getSummary(),
    task.getStartDate(),
    task.getEndDate(),
    task.getHourPerDay(),
    r
  );
}
function detectWritingRow(
  spreadSheet: GoogleAppsScript.Spreadsheet.Spreadsheet,
  summary: string
): number {
  var r = RunningTasksConfig.startRow - 1;
  var v: string = null;

  while (true) {
    r++;
    let v = spreadSheet
      .getRange(RunningTasksConfig.summaryColumnName + r)
      .getValue();
    console.log("Checking row = %d, v = %s, summary = %s", r, v, summary);
    if (v == null || v == "" || v == undefined || v == summary || r >= 100) {
      return r;
    }
  }
  return r;
}

function runningTasks(): Task[] {
  var tasks: Task[] = [];
  var r = RunningTasksConfig.startRow;
  var v: string = null;

  var spreadSheet = sheetFromName(TaskManagerConfig.sheetName);

  while (true) {
    r++;
    var summary = spreadSheet
      .getRange(RunningTasksConfig.summaryColumnName + r)
      .getValue();
    if (v == null || v == "" || v == undefined || v == summary || r >= 100) {
      break;
    }
    var startDate = spreadSheet
      .getRange(RunningTasksConfig.startDateColumnName + r)
      .getValue();
    var endDate = spreadSheet
      .getRange(RunningTasksConfig.endDateColumnName + r)
      .getValue();
    var hourPerDate = spreadSheet
      .getRange(RunningTasksConfig.hourPerDayColumnName + r)
      .getValue();

    tasks.push(new Task(summary, startDate, endDate, hourPerDate));
  }
  return tasks;
}
