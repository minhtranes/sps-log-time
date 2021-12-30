class DateUtility {
  static formatDate(date: Date): string {
    return Utilities.formatDate(date, "GMT+7", "yyyy.MM.dd");
  }
  static addDays(intoDate: Date, days: number): Date {
    var newDate = new Date(intoDate);
    newDate.setDate(intoDate.getDate() + days);
    return newDate;
  }

  static begin(date: Date): Date {
    var newDate = date == null ? new Date() : date;
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  }

  static beginningOfThisMonth(): Date {
    var today = new Date();
    today.setDate(1);
    return this.begin(today);
  }
}

class SheetNames {
  static appendReportSheet(suffix: string): string {
    return "Report_" + suffix;
  }

  static reportSheet(dateString: string): string {
    var yearMonth = dateString.substring(0, "yyyy.MM".length);
    return SheetNames.appendReportSheet(yearMonth);
  }
}
