class Task {
  private summary: string;
  private startDate: Date;
  private endDate: Date;
  private hourPerDay: number;

  constructor(
    summary: string,
    startDate: Date,
    endDate: Date,
    hourPerDay: number
  ) {
    this.summary = summary;
    this.startDate = startDate;
    this.endDate = endDate;
    this.hourPerDay = hourPerDay;
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

  public getEndDate(): Date {
    return this.endDate;
  }

  public setEndDate(endDate: Date): void {
    this.endDate = endDate;
  }

  public getHourPerDay(): number {
    return this.hourPerDay;
  }

  public setHourPerDay(hourPerDay: number): void {
    this.hourPerDay = hourPerDay;
  }
}
