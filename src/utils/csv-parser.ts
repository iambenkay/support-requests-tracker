import json2csv, {Parser} from "json2csv";

export function parse(data: {[key: string]: any}, {fields}: json2csv.Options<any>): string {
    // json2csv loads all JSON in memory before parsing to CSV
    // not suitable for large JSON data. AsyncParser method is preferable
    const parser = new Parser({fields});
    return parser.parse(data);
}