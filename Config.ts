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
  static monthColumnName: string = "F";
  static teamColumnName: string = "G";
  static internalCodeColumnName: string = "H";
  static commentColumnNumber: number = 5;
  static categoryColumnName: string = "I";
  static taskColumnName: string = "J";
  static taskColumnNumber: number = 10;
}

class TaskManagerConfig {
  static sheetName = "Task Manager";
  static labelColumnName: string = "B";
  static valueColumnName: string = "C";
  static summaryRow: number = 3;
  static startDateRow: number = 4;
  static endDateRow: number = 5;
  static offDayRow: number = 6;
  static hourPerDayRow: number = 7;
  static categoryRow: number = 8;
  static workShiftDurationInHourRow: number = 9;
  static minTaskDurationInHourRow: number = 10;

  static defaultTaskExpirationDays: number = 20;
  static offTaskSummary: string = "Off";
  static offTaskCategory: string = "Internal";
}

class RunningTasksConfig {
  static startRow: number = 15;
  static summaryColumnName: string = "E";
  static startDateColumnName: string = "F";
  static endDateColumnName: string = "G";
  static hourPerDayColumnName: string = "H";
  static categoryColumnName: string = "I";
}
