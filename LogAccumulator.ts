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

  var dateRows: number[] = detectReportRange(sheet, date);
  console.log("Delete the rows relate to date [%s]", date);
  dateRows.forEach((r) => {
    sheet.deleteRow(r);
  });
  var appliedTasks = tasks.filter((t) => {
    return t.getStartDate() <= date && t.getEndDate() >= date;
  });
  appliedTasks.forEach((t) => {
    t.setLoggedHour(
      t.getHourPerDay() > 0 ? t.getHourPerDay() : 8 / appliedTasks.length
    );
  });

  var insertRow = dateRows[dateRows.length];
  appliedTasks.forEach((t) => {
    sheet.insertRowAfter(insertRow);
    sheet
      .getRange(MonthlyReportConfig.commentColumnName + insertRow)
      .setValue(t.getSummary());
  });
}
function indicateReportSheet(date: Date): GoogleAppsScript.Spreadsheet.Sheet {
  var sheetName = date.getFullYear + "_" + date.getMonth;
  return sheetFromName(sheetName);
}
function detectReportRange(
  sheet: GoogleAppsScript.Spreadsheet.Sheet,
  date: Date
): number[] {
  var currentDate = Date.now;
  var r = MonthlyReportConfig.firstRow;
  var rn: number[] = [];
  while (true) {
    var s = sheet
      .getRange(MonthlyReportConfig.commentColumnName + r)
      .getValue();
    if (s == null || s == undefined || s == "") {
      break;
    }
    var d = sheet.getRange(MonthlyReportConfig.dateColumnName + r).getValue();
    if (d == date) {
      rn.push(r);
    }
  }
  if (rn.length <= 0) {
    rn.push(MonthlyReportConfig.firstRow);
    return rn;
  }
  if (rn.length > 1) {
    rn.sort((r1, r2) => {
      return r2 - r1;
    });
  }
  return rn;
}
