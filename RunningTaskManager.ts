function saveTask() {
  var spreadSheet: GoogleAppsScript.Spreadsheet.Spreadsheet =
    SpreadsheetApp.getActive();

  var offTask: boolean = spreadSheet
    .getRange(TaskManagerConfig.valueColumnName + TaskManagerConfig.offDayRow)
    .getValue();

  if (offTask) {
    var summary: string = TaskManagerConfig.offTaskSummary;
    var category: string = TaskManagerConfig.offTaskCategory;
  } else {
    var summary: string = spreadSheet
      .getRange(
        TaskManagerConfig.valueColumnName + TaskManagerConfig.summaryRow
      )
      .getValue();
    var category: string = spreadSheet
      .getRange(
        TaskManagerConfig.valueColumnName + TaskManagerConfig.categoryRow
      )
      .getValue();
    if (category == null || category == undefined || category == "") {
      console.log("Category can not be empty");
      return;
    }
    summary = category + "_" + summary;
  }

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
    if (offTask) {
      endDate = startDate;
    } else {
      endDate = DateUtility.addDays(
        startDate,
        TaskManagerConfig.defaultTaskExpirationDays
      );
    }
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

class DisplayedTask {
  private row: number;
  private summary: string;
  private startDate: Date;
  constructor(row: number, summary: string, startDate: Date) {
    this.row = row;
    this.summary = summary;
    this.startDate = startDate;
  }
  public getRow(): number {
    return this.row;
  }

  public setRow(row: number): void {
    this.row = row;
  }

  public getSummary(): string {
    return this.summary;
  }

  public setSummary(summary: string): void {
    this.summary = summary;
  }

  public getStartDate(): Date {
    return this.startDate;
  }

  public setStartDate(startDate: Date): void {
    this.startDate = startDate;
  }
}

function cleanLastMonthTask() {
  cleanExpiredTask(DateUtility.beginningOfThisMonth());
}

function cleanExpiredTask(lastDay: Date) {
  var r = RunningTasksConfig.startRow - 1;
  var expiredTasks: DisplayedTask[] = [];
  var today = DateUtility.begin(new Date());

  if (lastDay >= today) {
    console.log("Last day could not be greater or equals to today");
    return;
  }

  var spreadSheet = sheetFromName(TaskManagerConfig.sheetName);

  while (true) {
    r++;
    var summary = spreadSheet
      .getRange(RunningTasksConfig.summaryColumnName + r)
      .getValue();
    console.log("Checking expiration of row = %d, summary = %s", r, summary);
    if (summary == null || summary == "" || summary == undefined || r >= 100) {
      break;
    }
    var startDate = spreadSheet
      .getRange(RunningTasksConfig.startDateColumnName + r)
      .getValue();
    var endDate = spreadSheet
      .getRange(RunningTasksConfig.endDateColumnName + r)
      .getValue();
    if (endDate < lastDay) {
      expiredTasks.push(new DisplayedTask(r, summary, startDate));
    }
  }
  if (expiredTasks.length <= 0) {
    console.log("There is no expired task");
    return;
  }
  var sheet = sheetFromName(TaskManagerConfig.sheetName);
  expiredTasks
    .sort((r1, r2) => {
      return r2.getRow() - r1.getRow();
    })
    .forEach((r) => {
      sheet.deleteRow(r.getRow());
      console.log("Deleted task [%s] at row [%d]", r.getRow(), r.getSummary());
    });
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
