function saveTask() {
  var spreadSheet: GoogleAppsScript.Spreadsheet.Spreadsheet =
    SpreadsheetApp.getActive();
  var summary: string = spreadSheet
    .getRange(TaskManagerConfig.valueColumnName + TaskManagerConfig.summaryRow)
    .getValue();
  var category: string = spreadSheet
    .getRange(TaskManagerConfig.valueColumnName + TaskManagerConfig.categoryRow)
    .getValue();
  if (category == null || category == undefined || category == "") {
    console.log("Category can not be empty");
    return;
  }
  summary = category + "_" + summary;

  var startDate: Date = spreadSheet
    .getRange(
      TaskManagerConfig.valueColumnName + TaskManagerConfig.startDateRow
    )
    .getValue();
  startDate = DateUtility.begin(startDate);
  var endDate: Date = spreadSheet
    .getRange(TaskManagerConfig.valueColumnName + TaskManagerConfig.endDateRow)
    .getValue();
  if (endDate == null || endDate == undefined || endDate.toString() == "") {
    endDate = DateUtility.addDays(startDate, 20);
  }
  endDate = DateUtility.begin(endDate);
  var hourPerDay: number = spreadSheet
    .getRange(
      TaskManagerConfig.valueColumnName + TaskManagerConfig.hourPerDayRow
    )
    .getValue();
  if (hourPerDay == null || hourPerDay == undefined) {
    hourPerDay = 0;
  }

  var task = new Task(summary, startDate, endDate, hourPerDay);
  task.setCategory(category);
  writeTask(task);
}
function writeTask(task: Task) {
  var spreadSheet: GoogleAppsScript.Spreadsheet.Spreadsheet =
    SpreadsheetApp.getActive();
  var r = detectWritingRow(spreadSheet, task.getSummary(), task.getStartDate());

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
  spreadSheet
    .getRange(RunningTasksConfig.categoryColumnName + r)
    .setValue(task.getCategory());
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
  summary: string,
  startDate: Date
): number {
  var r = RunningTasksConfig.startRow - 1;
  var v: string = null;

  while (true) {
    r++;
    let v = spreadSheet
      .getRange(RunningTasksConfig.summaryColumnName + r)
      .getValue();
    console.log("Checking row = %d, v = %s, summary = %s", r, v, summary);
    if (v == null || v == "" || v == undefined || r >= 100) {
      return r;
    }
    var sd = spreadSheet
      .getRange(RunningTasksConfig.startDateColumnName + r)
      .getValue();
    if (v == summary && sd.getTime() == startDate.getTime()) {
      return r;
    }
  }
  return r;
}

function runningTasks(): Task[] {
  var tasks: Task[] = [];
  var r = RunningTasksConfig.startRow - 1;
  var v: string = null;

  var spreadSheet = sheetFromName(TaskManagerConfig.sheetName);

  while (true) {
    r++;
    var summary = spreadSheet
      .getRange(RunningTasksConfig.summaryColumnName + r)
      .getValue();
    console.log("Collecting from row = %d, summary = %s", r, summary);
    if (summary == null || summary == "" || summary == undefined || r >= 100) {
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
    var category = spreadSheet
      .getRange(RunningTasksConfig.categoryColumnName + r)
      .getValue();
    var task = new Task(summary, startDate, endDate, hourPerDate);
    task.setCategory(category);
    task.setLoggedHour(0);
    tasks.push(task);
  }
  return tasks;
}
