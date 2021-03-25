import { insert, update } from "../../../db/database.handler";
import { DbItem } from "../../db_items/core/db.item";
import { EventItem } from "../../db_items/event.item";
import { Export } from "../../game_models/core/export.item";
import { Save } from "../../game_models/core/save.item";
import { EventPacket } from "../../packets/event.packet";
import * as conf from '../../../db/database.config.json';

export class Event implements Export, Save {
    
    id: string;
    game_id: string;
    player_id: string;
    event_type: string;
    trigger_time: number;
    body: any;


    constructor(data: any) {
        this.id = data.id;
        this.game_id = data.game_id;
        this.player_id = data.player_id;
        this.event_type = data.event_type;
        this.trigger_time = data.trigger_time;
        this.body = "";
    }
    async saveItem(): Promise<void> {
        this.setBody();
        const item = this.exportItem();
        if (!item.id) {
            item.generateId();
            this.id = item.id as string;
            await insert(conf.tables.event, item);
        } else {
            await update(conf.tables.event, item);
        }

    }

    protected setBody() {
        this.body = '';
    }

    exportItem(): DbItem {
        const item = new EventItem(this);
        return item;
    }
    exportPacket(): EventPacket {
        return {
            id: this.id,
            event_type: this.event_type,
            trigger_time: this.trigger_time,
            body: this.body,
        } as EventPacket;
    }

    async trigger(): Promise<Event | undefined> {
        console.log('Empty event triggered!');
        return this;
    }

}