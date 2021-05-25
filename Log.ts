class ReportLog {
    public static REPORT_ACTION_UPDATE = 'UPDATE';
    public static REPORT_ACTION_DELETE = 'DELETE';
    public static REPORT_ACTION_NEW = 'NEW';
    private _log: Log;
    private _row: number;
    private _action: string;
    constructor(log: Log, row: number) {
        this._log = log;
        this._row = row;
    }

    public get log(): Log {
        return this._log;
    }


    public set row(v: number) {
        this._row = v;
    }


    public get row(): number {
        return this._row;
    }

    public set action(v: string) {
        this._action = v;
    }


    public get action(): string {
        return this._action;
    }


}
class Log {
    private _id: string;
    private _name: string;
    private _date: Date;
    private _category: string;
    private _task: string;
    private _duration: number;

    constructor(id: string, name: string, date: Date, category: string, task: string) {
        this._id = id;
        this._name = name;
        this._date = date;
        this._category = category;
        this._task = task;
    }

    public set id(v: string) {
        this._id = v;
    }

    public get id(): string {
        return this._id;
    }


    public set name(v: string) {
        this._name = v;
    }

    public get name(): string {
        return this._name;
    }

    public get date(): Date {
        return this._date;
    }


    public set date(v: Date) {
        this._date = v;
    }


    public get category(): string {
        return this._category;
    }

    public set category(v: string) {
        this._category = v;
    }


    public get task(): string {
        return this._task;
    }


    public set task(v: string) {
        this._task = v;
    }


    public set duration(v: number) {
        this._duration = v;
    }

    public get duration(): number {
        return this._duration;
    }

}