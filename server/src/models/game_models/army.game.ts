import { ArmyItem } from '../db_items/army.item';
import { Battalion } from './battalion.game';
import { Export } from './core/export.item';
import { Save } from './core/save.item';
import * as conf from '../../db/database.config.json';
import { deleteItem, fetch, fetchAll, insert, update } from '../../db/database.handler';
import { BattalionItem } from '../db_items/battalion.item';
import { ArmyPacket } from '../packets/army.packet';
import { ArmyInventory } from './army-inventory.game';
import { ArmyInventoryItem } from '../db_items/army-inventory.item';
import { ResourceItem } from '../db_items/resource.item';
import { Delete } from './core/delete.item';
export class Army implements Export, Save, Delete {
   
    id: string;
    player_id: string;
    x: number;
    y: number;
    name: string;

    battalions: Battalion[];
    inventory: ArmyInventory | undefined;
    inventorySpace: number;

    constructor(data: any) {
        this.id = data.id;
        this.player_id = data.player_id;
        this.x = data.x;
        this.y = data.y;
        this.name = data.name;
        this.battalions = [];
        this.inventorySpace = 0;
    }
    async deleteItem() {
        await this.load();
        await Promise.all([
            await this.inventory?.deleteItem(),
            this.battalions.map(async (b: Battalion) => await b.deleteItem())
        ]);
        await deleteItem(conf.tables.army, new ArmyItem({id: this.id}));
    }
    exportPacket(): ArmyPacket {
        return {
            id: this.id,
            player_id: this.player_id, 
            name: this.name,
            x: this.x,
            y: this.y,
            battalions: this.battalions.map((battalion: Battalion) => battalion.exportPacket()),
            inventory: this.inventory?.exportPacket(),
        } as ArmyPacket;
    }
    
    async saveItem(): Promise<ArmyItem> {
        const item = this.exportItem();
        if (!item.id) {
            item.generateId();
            item.name = escape(item.name);
            this.id = item.id as string;
            await insert(conf.tables.army, item);
        } else {
            await update(conf.tables.army, item);
        }
        await Promise.all(this.battalions.map(async (battalion: Battalion) => {
            battalion.army_id = this.id
            return await battalion.saveItem();
        }));
        if (!this.inventory) {
            this.inventory = new ArmyInventory(new ArmyInventoryItem({army_id: this.id, player_id: this.player_id}));    
        }
        await this.inventory.saveItem();
        return item;
    }
    
    exportItem(): ArmyItem {
        return new ArmyItem(this);
    }

    async load() {
        await Promise.all([
            this.loadBattalions(),
            this.loadInventory(),
        ]);
    }


    private async loadBattalions(): Promise<void> {
        if (this.id) {
            const battalions = await fetch<BattalionItem>(conf.tables.battalion, new BattalionItem({army_id: this.id}));
            this.battalions = battalions.map((battalion: BattalionItem) => new Battalion(battalion));
            await Promise.all(this.battalions.map(async (bat: Battalion) => await bat.load()));
            this.inventorySpace = 0;
            this.battalions.forEach((b: Battalion) => this.inventorySpace += b.carry);
        }
    }

    private async loadInventory(): Promise<void> {
        if (this.id) {
            const inventories = await fetch<ArmyInventoryItem>(conf.tables.army_inventory, new ArmyInventoryItem({army_id: this.id}));
            this.inventory = inventories.map((battalion: ArmyInventoryItem) => new ArmyInventory(battalion)).pop() as ArmyInventory;
        }
    }

    async addToInventory(drops: any): Promise<any | void> {
        const resources = await fetchAll<ResourceItem>(conf.tables.resources);
        if (!this.inventory) {
            console.log('ARMY DOES NOT HAVE INVENTORY!');
            return;
        }
        for (const dropId of Object.keys(drops)) {
            const res = this.getResourceById(dropId, resources);
            if (res) {
                const volume = drops[dropId];
                if (await this.inventory?.calcWeight(resources) ?? 0 >= volume * res.weight) {
                    this.inventory[res.tag] += volume;
                    delete drops[dropId];
                }
            }
        }
        return drops;
    }

    async mergeInventory(inventory: ArmyInventory | undefined): Promise<ArmyInventory | undefined> {
        const resources = await fetchAll<ResourceItem>(conf.tables.resources);
        if (!this.inventory || !inventory) {
            console.log('ARMY DOES NOT HAVE INVENTORY!');
            return;
        }
        for (const res of resources) {
            if (res) {
                if (await this.inventory.calcWeight(resources) ?? 0 >= (inventory[res.tag] * res.weight + await this.inventory.calcWeight(resources))) {
                    this.inventory[res.tag] += inventory[res.tag];
                    inventory[res.tag] = 0;
                } else {
                    break;
                }
            }
        }
        return inventory;
    }

    private getResourceById(id: string, resources: ResourceItem[]): ResourceItem | undefined {
        for (const res of resources) {
            if (id == res.id) {
                return res;
            }
        }
        return undefined;
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