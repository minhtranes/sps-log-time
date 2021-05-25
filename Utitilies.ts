class DateUtility {
    
    static formatDate(date: Date): string {
        return Utilities.formatDate(date, "GMT+7", "yyyy.MM.dd");
    }
}

class SheetNames {
    static appendReportSheet(suffix: string): string {
        return "Report_" + suffix;
    }

    static reportSheet(dateString: string): string {
        var yearMonth = dateString.substr(0, "yyyy.MM".length);
        return SheetNames.appendReportSheet(yearMonth);
    }
}