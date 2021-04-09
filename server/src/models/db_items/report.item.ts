import { DbItem } from "./core/db.item";

export class ReportItem extends DbItem {
    player_id: string;
    report_read: boolean;
    report_type: string;
    body: string;

    constructor(data) {
        super(data);
        this.player_id = data.player_id;
        this.report_read = data.report_read;
        this.report_type = data.report_type;
        this.body = data.body;
    }
}