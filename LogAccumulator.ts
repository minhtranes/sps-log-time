function accumulateToday() {
  var today = new Date();
  var accStartDate = DateUtility.begin(today);
  var accEndDate = DateUtility.begin(today);

  accumulateRange(accStartDate, accEndDate);
}

function accumulateYesterday() {
  var yesterday = DateUtility.addDays(new Date(), -1);
  var accStartDate = DateUtility.begin(yesterday);
  var accEndDate = DateUtility.begin(yesterday);

  accumulateRange(accStartDate, accEndDate);
}

function accumulateThisMonth() {
  var accStartDate = new Date();
  accStartDate.setMonth(accStartDate.getMonth(), 1);
  accStartDate = DateUtility.begin(accStartDate);
  var accEndDate = DateUtility.begin(new Date());

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
    accumulateDay(tasks, date);
    date = DateUtility.addDays(date, 1);
  }
}
function accumulateDay(tasks: Task[], date: Date) {
  var appliedTasks = tasks.filter((t) => {
    return t.getStartDate() <= date && t.getEndDate() >= date;
  });

  if (appliedTasks.length <= 0) {
    console.warn("There is no task applied for day [%s] !", date);
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

  var fixedTasks = appliedTasks.filter((t) => t.getHourPerDay() > 0);
  var sumFixedTasks =
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
    var restH = 8 - sumFixedTasks;
    var c = 0;
    while (restH > 0) {
      var idx = c % appliedTasks.length;
      if (appliedTasks[idx].getHourPerDay() > 0) {
        c++;
        continue;
      }
      appliedTasks[idx].setLoggedHour(appliedTasks[idx].getLoggedHour() + 1);

      restH--;
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

    sheet.getRange(MonthlyReportConfig.idColumnName + insertRow).setValue(3144);
    sheet
      .getRange(MonthlyReportConfig.nameColumnName + insertRow)
      .setValue("Trần Hoàng Minh");
    sheet
      .getRange(MonthlyReportConfig.categoryColumnName + insertRow)
      .setValue(t.getCategory());
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
