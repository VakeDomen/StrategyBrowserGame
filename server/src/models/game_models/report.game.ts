import { insert, update } from "../../db/database.handler";
import { DbItem } from "../db_items/core/db.item";
import { ReportItem } from "../db_items/report.item";
import { ReportPacket } from "../packets/report.packet";
import { Export } from "./core/export.item";
import { Save } from "./core/save.item";
import * as conf from '../../db/database.config.json';

export class Report implements Save, Export {
    
    id: string;
    player_id: string;
    report_read: boolean;
    report_type: string;
    body: string;

    constructor(data) {
        this.id = data.id;
        this.player_id = data.player_id;
        this.report_read = data.report_read;
        this.report_type = data.report_type;
        this.body = data.body;
    }
    
    exportItem(): DbItem {
        return new ReportItem(this);
    }

    exportPacket() {
        return {
            id: this.id,
            player_id: this.player_id,
            report_read: this.report_read,
            report_type: this.report_type,
            body: this.body,
        } as ReportPacket;
    }
    
    async saveItem() {
        const item = this.exportItem();
        if (!item.id) {
            item.generateId();
            this.id = item.id as string;
            await insert(conf.tables.reports, item);
        } else {
            await update(conf.tables.reports, item);
        }
        return item;
    }
}