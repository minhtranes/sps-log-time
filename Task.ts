class Task {
  private summary: string;
  private startDate: Date;
  private endDate: Date;
  private hourPerDay: number;
  private loggedHour: number;
  private category: string;
  private isOffTask: boolean = false;
  private isOTTask: boolean = false;

  public isIsOTTask(): boolean {
    return this.isOTTask;
  }

  public setOTTask(isOTTask: boolean): void {
    this.isOTTask = isOTTask;
  }

  public isIsOffTask(): boolean {
    return this.isOffTask;
  }

  public setIsOffTask(isOffTask: boolean): void {
    this.isOffTask = isOffTask;
  }

  public getCategory(): string {
    return this.category;
  }

  public setCategory(category: string): void {
    this.category = category;
  }

  public getLoggedHour(): number {
    return this.loggedHour;
  }

  public setLoggedHour(loggedHour: number): void {
    this.loggedHour = loggedHour;
  }

  constructor(
    summary: string,
    startDate: Date,
    endDate: Date,
    hourPerDay: number,
    isOTTask: boolean
  ) {
    this.summary = summary;
    this.startDate = startDate;
    this.endDate = endDate;
    this.hourPerDay = hourPerDay;
    this.isOTTask = isOTTask;
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
