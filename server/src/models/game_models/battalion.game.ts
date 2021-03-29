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
    horse: boolean;
    cart: boolean;
    ARMOR: number;
    WEAPON_2H: number;
    WEAPON_1H: number;
    OFF_HAND: number;
    TOOL: number;

    constructor(data: any) {
        this.id = data.id;
        this.army_id = data.army_id;
        this.size = data.size;
        this.horse = data.horse;
        this.cart = data.cart;
        this.ARMOR = data.ARMOR;
        this.WEAPON_2H = data.WEAPON_2H;
        this.WEAPON_1H = data.WEAPON_1H;
        this.OFF_HAND = data.OFF_HAND;
        this.TOOL = data.TOOL;
    }
    exportPacket(): BattalionPacket {
        return {
            id: this.id,
            army_id: this.army_id,
            size: this.size,
            horse: this.horse,
            cart: this.cart,
            ARMOR: this.ARMOR,
            WEAPON_2H: this.WEAPON_2H,
            WEAPON_1H: this.WEAPON_1H,
            OFF_HAND: this.OFF_HAND,
            TOOL: this.TOOL,
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