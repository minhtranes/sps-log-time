class LogConfig {
  static sheetName = "Logs";
  static logFirstRow: number = 3;
  static idColumnName: string = "A";
  static nameColumnName: string = "B";
  static dateColumnName: string = "C";
  static durationColumnName: string = "D";

  static commentColumnName: string = "E";
  static commentColumnNumber: number = 5;

  static categoryColumnName: string = "I";
  static taskColumnName: string = "J";
  static taskColumnNameNumber: number = 10;
}

class MonthlyReportConfig {
  static firstRow: number = 1;

  static idColumnName: string = "A";
  static idColumnNmber: number = 1;
  static nameColumnName: string = "B";
  static dateColumnName: string = "C";
  static dateColumnNumber: number = 3;
  static durationColumnName: string = "D";
  static commentColumnName: string = "E";
  static commentColumnNumber: number = 5;
  static categoryColumnName: string = "I";
  static taskColumnName: string = "J";
  static taskColumnNumber: number = 10;
}

class TaskManagerConfig {
  static labelColumnName: string = "B";
  static valueColumnName: string = "C";
  static summaryRow: number = 3;
  static startDateRow: number = 4;
  static endDateRow: number = 5;
  static hourPerDayRow: number = 6;
}

class RunningTasksConfig {
  static startRow: number = 3;
  static summaryColumnName: string = "G";
  static startDateColumnName: string = "H";
  static endDateColumnName: string = "I";
  static hourPerDayColumnName: string = "J";
}
