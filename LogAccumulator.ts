function accumulateToday() {
  accumulateLastNDays(0);
}

function accumulateTomorrow() {
  accumulateLastNDays(1);
}

function accumulateYesterday() {
  accumulateLastNDays(-1);
}

function accumulateLast2Days() {
  accumulateLastNDays(-2);
}

function accumulateLast3Days() {
  accumulateLastNDays(-3);
}

function accumulateLast4Days() {
  accumulateLastNDays(-4);
}

function accumulateLast5Days() {
  accumulateLastNDays(-5);
}

function accumulateThisMonth() {
  var accStartDate = new Date();
  accStartDate.setMonth(accStartDate.getMonth(), 1);
  accStartDate = DateUtility.begin(accStartDate);
  var accEndDate = DateUtility.begin(new Date());

  accumulateRange(accStartDate, accEndDate);
}

function accumulateLastNDays(lastDays: number) {
  var yesterday = DateUtility.addDays(new Date(), -1);
  var accStartDate = DateUtility.begin(
    DateUtility.addDays(new Date(), lastDays)
  );
  var accEndDate = DateUtility.begin(yesterday);

  accumulateRange(accStartDate, accEndDate);
}

function accumulateRange(accStartDate: Date, accEndDate: Date) {
  if (accStartDate > accEndDate) {
    console.log(
      "End day[%s] must be after or same start day[%s]",
      accEndDate,
      accStartDate
    );
    return;
  }

  var spreadSheet = sheetFromName(TaskManagerConfig.sheetName);
  var workShiftDurationInHour: number = spreadSheet
    .getRange(
      TaskManagerConfig.valueColumnName +
        TaskManagerConfig.workShiftDurationInHourRow
    )
    .getValue();
  var minTaskDurationInHour: number = spreadSheet
    .getRange(
      TaskManagerConfig.valueColumnName +
        TaskManagerConfig.minTaskDurationInHourRow
    )
    .getValue();
  var employeeName: string = spreadSheet
    .getRange(
      TaskManagerConfig.valueColumnName + TaskManagerConfig.employeeNameRow
    )
    .getValue();
  var employeeId: string = spreadSheet
    .getRange(
      TaskManagerConfig.valueColumnName + TaskManagerConfig.employeeIdRow
    )
    .getValue();
  var internalCode: string = spreadSheet
    .getRange(
      TaskManagerConfig.valueColumnName + TaskManagerConfig.internalCodeRow
    )
    .getValue();
  var team: string = spreadSheet
    .getRange(TaskManagerConfig.valueColumnName + TaskManagerConfig.teamRow)
    .getValue();

  var tasks: Task[] = runningTasks();
  if (tasks == null || tasks.length <= 0) {
    console.log("There is no running task");
    return;
  }

  console.log("Accumulate logs from [%s] to [%s]", accStartDate, accEndDate);
  var date = accStartDate;

  while (date <= accEndDate) {
    if (date.getDay() == 0 || date.getDay() == 6) {
      console.log("Ignore Sunday and Saturday [%s]", date);
      date = DateUtility.addDays(date, 1);
      continue;
    }
    accumulateDay(
      tasks,
      date,
      workShiftDurationInHour,
      minTaskDurationInHour,
      employeeName,
      employeeId,
      internalCode,
      team
    );
    date = DateUtility.addDays(date, 1);
  }
}

function accumulateDay(
  tasks: Task[],
  date: Date,
  workShiftDurationInHour: number,
  minTaskDurationInHour: number,
  employeeName: string,
  employeeId: string,
  internalCode: string,
  team: string
) {
  /*
   * There are three type of tasks:
   *   + Fixed task: normal task which has predefined duration
   *   + Adjusted task: normal task whose duration is calculated to fulfill a working shift duration
   *   + Overtime task: special task which is appended after calculate working shift
   */
  var appliedTasks = tasks.filter((t) => {
    return t.getStartDate() <= date && t.getEndDate() >= date;
  });

  if (appliedTasks.length <= 0) {
    console.warn("There is no task applied for day [%s] !", date);
    return;
  }
  if (
    appliedTasks.filter(
      (t) => t.getSummary() == TaskManagerConfig.offTaskSummary
    ).length > 0
  ) {
    console.info("[%s] is an off day", date);
    return;
  }

  console.log("Reset logged time to 0");
  appliedTasks.forEach((t) => t.setLoggedHour(0));
  console.log("Accumulate date [%s]", date);
  var sheet = indicateReportSheet(date);
  console.log("Report sheet is [%s]", sheet.getName());

  var dateRows: number[] = detectReportRange(sheet, date);

  if (dateRows.length > 0) {
    dateRows.forEach((r) => {
      sheet.deleteRow(r);
      console.log("Deleted row [%d]", r);
    });
  }
  if (dateRows.length <= 0) {
    dateRows.push(MonthlyReportConfig.firstRow);
  }

  // Filter for the fixed tasks
  var fixedTasks = appliedTasks.filter(
    (t) => t.getHourPerDay() > 0 && t.isIsOTTask() != true
  );
  var sumFixedTasksInHour =
    fixedTasks.length > 0
      ? fixedTasks
          .map((t) => t.getHourPerDay())
          .reduce((t1, t2) => {
            return t1 + t2;
          })
      : 0;

  appliedTasks
    .filter((t) => t.getHourPerDay() > 0)
    .forEach((t) => t.setLoggedHour(t.getHourPerDay()));

  if (fixedTasks < appliedTasks) {
    // Calculate the Adjusted Tasks
    var restH = workShiftDurationInHour - sumFixedTasksInHour;
    var c = 0;
    while (restH > 0) {
      var idx = c % appliedTasks.length;
      if (
        appliedTasks[idx].getHourPerDay() > 0 ||
        appliedTasks[idx].isIsOTTask()
      ) {
        // Skip the Fixed tasks and OT task
        c++;
        continue;
      }
      appliedTasks[idx].setLoggedHour(
        appliedTasks[idx].getLoggedHour() +
          (restH < minTaskDurationInHour ? restH : minTaskDurationInHour)
      );

      restH -= minTaskDurationInHour;
      c++;
    }
  }
  appliedTasks
    .filter((t) => t.getLoggedHour() <= 0)
    .forEach((t) => {
      t.setLoggedHour(1);
      console.warn("Assign %d for task [%s]", 1, t.getSummary());
    });

  console.log("Append rows of date [%s]", date);
  var insertRow = dateRows[dateRows.length - 1];
  appliedTasks.forEach((t) => {
    sheet.insertRows(insertRow);
    sheet
      .getRange(MonthlyReportConfig.commentColumnName + insertRow)
      .setValue(t.getSummary());
    sheet
      .getRange(MonthlyReportConfig.dateColumnName + insertRow)
      .setValue(date);
    sheet
      .getRange(MonthlyReportConfig.durationColumnName + insertRow)
      .setValue(t.getLoggedHour());

    sheet
      .getRange(MonthlyReportConfig.idColumnName + insertRow)
      .setValue(employeeId);
    sheet
      .getRange(MonthlyReportConfig.nameColumnName + insertRow)
      .setValue(employeeName);
    sheet
      .getRange(MonthlyReportConfig.monthColumnName + insertRow)
      .setValue(date.getMonth() + 1);
    sheet
      .getRange(MonthlyReportConfig.internalCodeColumnName + insertRow)
      .setValue(internalCode);
    sheet
      .getRange(MonthlyReportConfig.teamColumnName + insertRow)
      .setValue(team);
    sheet
      .getRange(MonthlyReportConfig.categoryColumnName + insertRow)
      .setValue(t.getCategory());
    sheet
      .getRange(MonthlyReportConfig.otColumnName + insertRow)
      .setValue(t.isIsOTTask());
  });
}
function indicateReportSheet(date: Date): GoogleAppsScript.Spreadsheet.Sheet {
  var sheetName = Utilities.formatDate(date, "GMT+7", "yyyy.MM");
  return sheetFromName(sheetName);
}
function detectReportRange(
  sheet: GoogleAppsScript.Spreadsheet.Sheet,
  date: Date
): number[] {
  var r = MonthlyReportConfig.firstRow;
  var rn: number[] = [];
  while (true) {
    var s = sheet
      .getRange(MonthlyReportConfig.commentColumnName + r)
      .getValue();
    if (s == null || s == undefined || s == "") {
      break;
    }
    var d: Date = sheet
      .getRange(MonthlyReportConfig.dateColumnName + r)
      .getValue();
    console.log("Checking row = %d, logged date = %s, date = %s", r, d, date);
    if (d.getTime() == date.getTime()) {
      rn.push(r);
    }
    r++;
  }

  if (rn.length > 1) {
    rn.sort((r1, r2) => {
      return r2 - r1;
    });
  }
  return rn;
}
