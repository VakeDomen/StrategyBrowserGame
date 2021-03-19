import { ArmyItem } from '../db_items/army.item';
import { Battalion } from './battalion.game';
import { Export } from './core/export.item';
import { Save } from './core/save.item';
import * as conf from '../../db/database.config.json';
import { fetch, insert, update } from '../../db/database.handler';
import { BattalionItem } from '../db_items/battalion.item';
import { ArmyPacket } from '../packets/army.packet';
export class Army implements Export, Save {
    id: string;
    player_id: string;
    x: number;
    y: number;
    name: string;

    battalions: Battalion[];

    constructor(data: any) {
        this.id = data.id;
        this.player_id = data.player_id;
        this.x = data.x;
        this.y = data.y;
        this.name = data.name;
        this.battalions = [];
    }
    exportPacket(): ArmyPacket {
        return {
            id: this.id,
            player_id: this.player_id, 
            name: this.name,
            x: this.x,
            y: this.y,
            battalions: this.battalions.map((battalion: Battalion) => battalion.exportPacket())
        } as ArmyPacket;
    }
    
    async saveItem(): Promise<ArmyItem> {
        const item = this.exportItem();
        item.name = escape(item.name);
        if (!item.id) {
            item.generateId();
            this.id = item.id as string;
            await insert(conf.tables.army, item);
        } else {
            await update(conf.tables.army, item);
        }
        await Promise.all(this.battalions.map(async (battalion: Battalion) => {
            battalion.army_id = this.id
            return await battalion.saveItem();
        }))
        return item;
    }
    
    exportItem(): ArmyItem {
        return new ArmyItem(this);
    }


    async loadBattalions(): Promise<void> {
        if (this.id) {
            const battalions = await fetch<BattalionItem>(conf.tables.battalion, new BattalionItem({army_id: this.id}));
            this.battalions = battalions.map((battalion: BattalionItem) => new Battalion(battalion));
        }
    }

    createBattalion(size?: number): Battalion {
        const battalion = new Battalion({
            army_id: this.id,
            size: size ? size : 100
        });
        this.battalions.push(battalion);
        return battalion;
    }

}