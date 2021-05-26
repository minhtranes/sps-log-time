function accumulateToday() {
  var today = new Date();
  var accStartDate = DateUtility.begin(today);
  var accEndDate = DateUtility.begin(today);

  accumulateRange(accStartDate, accEndDate);
}

function accumulateYesterday() {
  var yesterday = DateUtility.addDays(null, -1);
  var accStartDate = DateUtility.begin(yesterday);
  var accEndDate = DateUtility.begin(yesterday);

  accumulateRange(accStartDate, accEndDate);
}

function testAccumulate() {
  var accStartDate = new Date();
  var accEndDate = new Date();
  accStartDate.setTime(Date.parse("2021-05-03 00:00:00"));
  accEndDate.setTime(Date.parse("2021-05-26 00:00:00"));

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
    if (date.getDay() == 0 || date.getDay() == 7) {
      console.log("Ignore Sunday and Saturday [%s]", date);
      date = DateUtility.addDays(date, 1);
      continue;
    }
    accumulateDay(tasks, date);
    date = DateUtility.addDays(date, 1);
  }
}
function accumulateDay(tasks: Task[], date: Date) {
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
  var appliedTasks = tasks.filter((t) => {
    return t.getStartDate() <= date && t.getEndDate() >= date;
  });

  var fixedTasks = appliedTasks.filter((t) => t.getHourPerDay() > 0);
  var sumFixedTasks =
    fixedTasks.length > 0
      ? fixedTasks
          .map((t) => t.getHourPerDay())
          .reduce((t1, t2) => {
            return t1 + t2;
          })
      : 0;
  var hourPerFlexTask = Math.floor(
    (8 - sumFixedTasks) / (appliedTasks.length - fixedTasks.length)
  );

  appliedTasks.forEach((t) => {
    t.setLoggedHour(
      t.getHourPerDay() > 0 ? t.getHourPerDay() : hourPerFlexTask
    );
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
