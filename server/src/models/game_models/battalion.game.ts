import { insert, update } from '../../db/database.handler';
import { BattalionItem } from '../db_items/battalion.item';
import { Export } from './core/export.item';
import { Save } from './core/save.item';
import * as conf from '../../db/database.config.json';
import { ArmyItem } from '../db_items/army.item';
import { BattalionPacket } from '../packets/battalion.packet';

export class Battalion implements Export, Save {
    id: string;
    army_id: string;
    size: number;

    constructor(data: any) {
        this.id = data.id;
        this.army_id = data.army_id;
        this.size = data.size;
    }
    exportPacket(): BattalionPacket {
        return {
            id: this.id,
            army_id: this.army_id,
            size: this.size,
        } as BattalionPacket;
    }

    async saveItem(): Promise<BattalionItem> {
        const item = this.exportItem();
        if (!item.id) {
            item.generateId();
            await insert(conf.tables.battalion, item);
        } else {
            await update(conf.tables.battalion, item);
        }
        return item;
    }

    exportItem(): BattalionItem {
        return new BattalionItem(this);
    }

    

}