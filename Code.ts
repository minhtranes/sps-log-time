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
    .addItem("Export Monthly Report", "exportMonthlyReports")
    .addItem("Test Export", "testAccumulate")
    .addItem("Accumulate Yesterday", "accumulateYesterday")
    .addToUi();
}

function onEdit(e) {
  var range: GoogleAppsScript.Spreadsheet.Range = e.range;
  var sheet = range.getSheet();
  if (sheet.getName() != LogConfig.sheetName) {
    return;
  }

  var changedRow = range.getRow();
  sheet
    .getRange("J1")
    .setValue("Edited col =  " + range.getColumn() + ", row = " + changedRow);

  if (range.getColumn() != LogConfig.taskColumnNameNumber) {
    return;
  }
  var updatedValue = range.getValue();
  if (updatedValue == null || updatedValue == "") {
    sheet.getRange(LogConfig.dateColumnName + changedRow).clear();
    return;
  }

  var dateRange = sheet.getRange(LogConfig.dateColumnName + changedRow);
  if (dateRange.getValue() == null || dateRange.getValue() == "") {
    dateRange.setValue(new Date());
  }
}

function exportMonthlyReports() {
  // Detect the months from the log raw and devide those records into monthly report sheet
  // Trigger cleanup job for the daily records older than 2 days
  // This will be triggered manually or scheduled job (daily, weekly)

  var logSheet: GoogleAppsScript.Spreadsheet.Sheet = sheetFromName(
    LogConfig.sheetName
  );

  var emptyCounter: number = 0;
  var currentRow: number = LogConfig.logFirstRow;

  var logsByDate: Map<string, Map<string, Log>> = new Map();

  while (emptyCounter < 5) {
    var task: string = logSheet
      .getRange(LogConfig.taskColumnName + currentRow)
      .getValue();
    if (task == null || task == "") {
      emptyCounter++;
      currentRow++;
      continue;
    }
    emptyCounter = 0;

    var id: string = logSheet
      .getRange(LogConfig.idColumnName + currentRow)
      .getValue();
    var name: string = logSheet
      .getRange(LogConfig.nameColumnName + currentRow)
      .getValue();
    var date: Date = logSheet
      .getRange(LogConfig.dateColumnName + currentRow)
      .getValue();
    var category: string = logSheet
      .getRange(LogConfig.categoryColumnName + currentRow)
      .getValue();
    var duration: number = logSheet
      .getRange(LogConfig.durationColumnName + currentRow)
      .getValue();

    var log = new Log(id, name, date, category, task);
    log.duration = duration;
    console.info(
      "Read [%s] [%s] [%s] [%s]...",
      DateUtility.formatDate(date),
      id,
      name,
      task
    );
    addLog(logsByDate, log);
    currentRow++;
  }

  if (logsByDate.size <= 0) {
    console.info("There is no log found!");
  }
  var reportSheets: Map<string, GoogleAppsScript.Spreadsheet.Sheet> = new Map();
  logsByDate.forEach((v: Map<string, Log>, k: string) => {
    var rptN = SheetNames.reportSheet(k);
    var reportSheet = sheetFromName(rptN);

    var reportedLogs = lookForLogs(
      reportSheet,
      k,
      MonthlyReportConfig.firstRow
    );
    mergeReport(v, reportedLogs);
    var total: number = reportedLogs
      .map((i) => i.log.duration)
      .reduce((sum, current) => sum + current, 0);
    console.info("[%s] was logged %d hrs", k, total);
    reportedLogs.forEach((rl) => {
      console.info(
        "     [%s]: %d hrs - %s",
        rl.action,
        rl.log.duration,
        rl.log.task
      );
    });
    updateReport(reportSheet, reportedLogs);
    reportSheets.set(rptN, reportSheet);
  });

  reportSheets.forEach((sheet, sheetName) => {
    sortReportByDate(sheet);
  });

  console.log("Process completed");
}

function addLog(store: Map<string, Map<string, Log>>, log: Log) {
  var dateString = DateUtility.formatDate(log.date);
  var lbd: Map<string, Log> = store.get(dateString);
  if (lbd == null) {
    lbd = new Map<string, Log>();
    store.set(dateString, lbd);
  }
  var elog: Log = lbd.get(log.task);
  if (elog != null) {
    elog.duration += log.duration;
  } else {
    lbd.set(log.task, log);
  }
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

function lookForLogs(
  sheet: GoogleAppsScript.Spreadsheet.Sheet,
  dateString: string,
  firstRow: number
): ReportLog[] {
  var logs: ReportLog[] = [];

  var currentRow = firstRow;
  var emptyCounter: number = 0;

  while (emptyCounter < 5) {
    var task: string = sheet
      .getRange(MonthlyReportConfig.taskColumnName + currentRow)
      .getValue();
    if (task == null || task == "") {
      emptyCounter++;
      currentRow++;
      continue;
    }
    emptyCounter = 0;
    var date: Date = sheet
      .getRange(MonthlyReportConfig.dateColumnName + currentRow)
      .getValue();
    var ds = DateUtility.formatDate(date);
    if (dateString != ds) {
      currentRow++;
      continue;
    }

    var id: string = sheet
      .getRange(MonthlyReportConfig.idColumnName + currentRow)
      .getValue();
    var name: string = sheet
      .getRange(MonthlyReportConfig.nameColumnName + currentRow)
      .getValue();

    var category: string = sheet
      .getRange(MonthlyReportConfig.categoryColumnName + currentRow)
      .getValue();

    var log = new Log(id, name, date, category, task);

    logs.push(new ReportLog(log, currentRow));

    currentRow++;
  }

  return logs;
}

function mergeReport(logs: Map<string, Log>, reportedLogs: ReportLog[]) {
  logs.forEach((v: Log, k: string) => {
    var f = reportedLogs.filter((r) => r.log.task == k);
    if (f == null || f.length <= 0) {
      var rl = new ReportLog(v, MonthlyReportConfig.firstRow);
      rl.action = ReportLog.REPORT_ACTION_NEW;
      reportedLogs.push(rl);
    } else {
      f.forEach((i) => {
        i.action = ReportLog.REPORT_ACTION_UPDATE;
        i.log.duration = v.duration;
      });
    }
  });

  reportedLogs
    .filter((i) => i.action == null || i.action == "")
    .forEach((i) => (i.action = ReportLog.REPORT_ACTION_DELETE));
}

function updateReport(
  reportSheet: GoogleAppsScript.Spreadsheet.Sheet,
  reportedLogs: ReportLog[]
) {
  var maxRowR = reportedLogs.reduce(
    (m, c) => (m.row < c.row ? c : m),
    reportedLogs[0]
  ).row;
  console.info("Greatest row is %d", maxRowR);
  reportedLogs
    .filter((i) => i.action == ReportLog.REPORT_ACTION_NEW)
    .forEach((i) => (i.row = maxRowR));
  reportedLogs.sort((a, b) => a.row - b.row);

  reportedLogs.forEach((rl) => {
    console.info("[%s]: %d hrs - %d", rl.action, rl.log.duration, rl.row);
  });

  var i = reportedLogs.length - 1;
  while (i >= 0) {
    var r = reportedLogs[i];
    switch (r.action) {
      case ReportLog.REPORT_ACTION_NEW:
        reportSheet.insertRowAfter(r.row);
        writeReportLine(reportSheet, r.log, r.row + 1);
        break;
      case ReportLog.REPORT_ACTION_UPDATE:
        writeReportLine(reportSheet, r.log, r.row);
        break;
      case ReportLog.REPORT_ACTION_DELETE:
        reportSheet.deleteRow(r.row);
        break;
      default:
        break;
    }
    i--;
  }
}

function writeReportLine(
  reportSheet: GoogleAppsScript.Spreadsheet.Sheet,
  r: Log,
  row: number
) {
  reportSheet.getRange(MonthlyReportConfig.idColumnName + row).setValue(r.id);
  reportSheet
    .getRange(MonthlyReportConfig.nameColumnName + row)
    .setValue(r.name);
  reportSheet
    .getRange(MonthlyReportConfig.dateColumnName + row)
    .setValue(r.date);
  reportSheet
    .getRange(MonthlyReportConfig.taskColumnName + row)
    .setValue(r.task);
  reportSheet
    .getRange(MonthlyReportConfig.commentColumnName + row)
    .setValue(r.category + "_Arch_" + r.task);
  reportSheet
    .getRange(MonthlyReportConfig.durationColumnName + row)
    .setValue(r.duration);
  reportSheet
    .getRange(MonthlyReportConfig.categoryColumnName + row)
    .setValue(r.category);
}

function sortReportByDate(sheet: GoogleAppsScript.Spreadsheet.Sheet) {
  sheet
    .getRange(
      MonthlyReportConfig.firstRow,
      MonthlyReportConfig.idColumnNmber,
      60,
      MonthlyReportConfig.taskColumnNumber -
        MonthlyReportConfig.idColumnNmber +
        1
    )
    .sort({ column: MonthlyReportConfig.dateColumnNumber, ascending: true });
}

function sectionize(
  sheet: GoogleAppsScript.Spreadsheet.Sheet,
  firstRow: number,
  dateColumnName: string
) {
  var emptyCounter: number = 0;
  var currentRow: number = firstRow;
  var currentDate: string;

  while (emptyCounter < 5) {
    var date: Date = sheet.getRange(dateColumnName + currentRow).getValue();
    if (date == null || date.toString() == "") {
      currentRow++;
      emptyCounter++;
      continue;
    }
    var ds = DateUtility.formatDate(date);
    console.info("ds = %s, cu = %s", ds, currentDate);
    if (currentDate == null) {
      currentDate = ds;
    }
    if (currentDate == ds) {
      currentRow++;
      continue;
    }
    currentDate = ds;
    console.info("Insert an empty row at [%d]", currentRow);
    sheet.insertRowBefore(currentRow);

    emptyCounter = 0;
    currentRow++;
  }
}
