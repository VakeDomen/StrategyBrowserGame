import { deleteItem, insert, update } from "../../db/database.handler";
import { ArmyInventoryItem } from "../db_items/army-inventory.item";
import { DbItem } from "../db_items/core/db.item";
import { ArmyInventoryPacket } from "../packets/army-inventory.packet";
import { Export } from "./core/export.item";
import { Save } from "./core/save.item";
import * as conf from '../../db/database.config.json';
import { fetchAll } from '../../db/database.handler';
import { ResourceItem } from "../db_items/resource.item";
import { Delete } from "./core/delete.item";

export class ArmyInventory implements Export, Save, Delete {
    id: string;
    game_id: string;
    player_id: string;
    army_id: string;
    food: number;
    wood: number;
    stone: number;
    ore: number;
    cart: number;
    horse: number;
    bow_T1: number;
    bow_T2: number;
    bow_T3: number;
    armor_T1: number;
    armor_T2: number;
    armor_T3: number;
    sword_T1: number;
    sword_T2: number;
    sword_T3: number;
    pike_T1: number;
    pike_T2: number;
    pike_T3: number;
    shield_T1: number;
    shield_T2: number;
    shield_T3: number;
    tools_T1: number;
    tools_T2: number;
    tools_T3: number;

    constructor(data: any) {
        this.id = data.id;
        this.game_id = data.game_id;
        this.player_id = data.player_id;
        this.army_id = data.army_id;
        this.food = data.food;
        this.wood = data.wood;
        this.stone = data.stone;
        this.ore = data.ore;
        this.cart = data.cart;
        this.horse = data.horse;
        this.bow_T1 = data.bow_T1;
        this.bow_T2 = data.bow_T2;
        this.bow_T3 = data.bow_T3;
        this.armor_T1 = data.armor_T1;
        this.armor_T2 = data.armor_T2;
        this.armor_T3 = data.armor_T3;
        this.sword_T1 = data.sword_T1;
        this.sword_T2 = data.sword_T2;
        this.sword_T3 = data.sword_T3;
        this.pike_T1 = data.pike_T1;
        this.pike_T2 = data.pike_T2;
        this.pike_T3 = data.pike_T3;
        this.shield_T1 = data.shield_T1;
        this.shield_T2 = data.shield_T2;
        this.shield_T3 = data.shield_T3;
        this.tools_T1 = data.tools_T1;
        this.tools_T2 = data.tools_T2;
        this.tools_T3 = data.tools_T3;
    }
    async deleteItem() {
        await deleteItem(conf.tables.army_inventory, new ArmyInventoryItem({id: this.id}));
    }

    blank(): ArmyInventory {
        this.food = 0;
        this.wood = 0;
        this.stone = 0;
        this.ore = 0;
        this.cart = 0;
        this.horse = 0;
        this.bow_T1 = 0;
        this.bow_T2 = 0;
        this.bow_T3 = 0;
        this.armor_T1 = 0;
        this.armor_T2 = 0;
        this.armor_T3 = 0;
        this.sword_T1 = 0;
        this.sword_T2 = 0;
        this.sword_T3 = 0;
        this.pike_T1 = 0;
        this.pike_T2 = 0;
        this.pike_T3 = 0;
        this.shield_T1 = 0;
        this.shield_T2 = 0;
        this.shield_T3 = 0;
        this.tools_T1 = 0;
        this.tools_T2 = 0;
        this.tools_T3 = 0;
        return this;
    }    
    async saveItem() {
        const item = this.exportItem();
        if (!item.id) {
            item.generateId();
            await insert(conf.tables.army_inventory, item);
        } else {
            await update(conf.tables.army_inventory, item);
        }
        return item;
    }
    exportItem(): DbItem {
        return new ArmyInventoryItem(this);
    }
    exportPacket(): ArmyInventoryPacket {
        return {
            id: this.id,
            game_id: this.game_id,
            player_id: this.player_id,
            army_id: this.army_id,
            food: this.food,
            wood: this.wood,
            stone: this.stone,
            ore: this.ore,
            cart: this.cart,
            horse: this.horse,
            bow_T1: this.bow_T1,
            bow_T2: this.bow_T2,
            bow_T3: this.bow_T3,
            armor_T1: this.armor_T1,
            armor_T2: this.armor_T2,
            armor_T3: this.armor_T3,
            sword_T1: this.sword_T1,
            sword_T2: this.sword_T2,
            sword_T3: this.sword_T3,
            pike_T1: this.pike_T1,
            pike_T2: this.pike_T2,
            pike_T3: this.pike_T3,
            shield_T1: this.shield_T1,
            shield_T2: this.shield_T2,
            shield_T3: this.shield_T3,
            tools_T1: this.tools_T1,
            tools_T2: this.tools_T2,
            tools_T3: this.tools_T3,
        } as ArmyInventoryPacket;
    }

    async emptyInvenotryOverfill(cap: number): Promise<any> {
        const resources = await fetchAll<ResourceItem>(conf.tables.resources);
        const drops = {};
        while (await this.calcWeight(resources) > cap) {
            // get random res to drop
            const randomRes = resources[Math.floor(Math.random() * resources.length)];
            
            // don't drop food
            if (randomRes.tag == 'food' || !randomRes.id) {
                continue;
            }
            // add res to drops
            if (this[randomRes.tag] > 0) {
                if (!drops[randomRes.id])  {
                    drops[randomRes.id] = 0;
                }
                drops[randomRes.id] += 1;
            }
            // remove res from inventory
            this[randomRes.tag] = Math.max(0, this[randomRes.tag] - 1);
        } 
        return drops;
    }

    async calcWeight(resources?: ResourceItem[]): Promise<number> {
        if (!resources) {
            resources = await fetchAll<ResourceItem>(conf.tables.resources);
        }
        let weight = 0;
        for (const resTag of Object.keys(this)) {
            const res = this.getResourceByTag(resTag, resources);
            if (res) {
                weight += res.weight * this[resTag];
            }
        }
        return weight;
    }

    private getResourceByTag(tag: string, resources: ResourceItem[]): ResourceItem | undefined {
        for (const res of resources) {
            if (tag == res.tag) {
                return res;
            }
        }
        return undefined;
    }

}