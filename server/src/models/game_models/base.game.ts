import { fetch, insert, update } from '../../db/database.handler';
import { BaseItem } from '../db_items/base.item';
import { Export } from './core/export.item';
import * as conf from '../../db/database.config.json';
import { Save } from './core/save.item';
import { BasePacket } from '../packets/base.packet';
import { BaseInventory } from './base-inventory.game';
import { BaseInventoryItem } from '../db_items/base-inventory.item';
export class Base implements Export, Save {
    id: string;
    player_id: string;
	x: number;
    y: number;
    base_type: number;
    name: string;
    size: number;

    inventory: BaseInventory | undefined;

    constructor(data: any) {
        this.id = data.id;
        this.player_id = data.player_id;
        this.x = data.x;
        this.y = data.y;
        this.base_type = data.base_type;
        this.name = data.name;
        this.size = data.size;
    }
    async saveItem(): Promise<BaseItem> {
        const item = this.exportItem();
        if (!item.id) {
            item.generateId();
            this.id = item.id as string;
            await insert(conf.tables.bases, item);
        } else {
            await update(conf.tables.bases, item);
        }
        if (!this.inventory) {
            this.inventory = new BaseInventory(new BaseInventoryItem({army_id: this.id, player_id: this.player_id}));    
        }
        await this.inventory.saveItem();
        return item;
    }

    exportPacket(): BasePacket {
        return {
            id: this.id,
            player_id: this.player_id,
            x: this.x,
            y: this.y,
            base_type: this.base_type,
            name: this.name,
            size: this.size,
        } as BasePacket;
    }

    exportItem(): BaseItem {
        return new BaseItem(this);
    }

    async load() {
        await Promise.all([
            this.loadInventory(),
        ])
    }

    private async loadInventory(): Promise<void> {
        if (this.id) {
            const inventories = await fetch<BaseInventoryItem>(conf.tables.base_inventory, new BaseInventoryItem({army_id: this.id}));
            this.inventory = inventories.map((inv: BaseInventoryItem) => new BaseInventory(inv)).pop() as BaseInventory;
        }
    }
}