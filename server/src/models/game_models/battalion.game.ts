import { deleteItem, fetch, fetchAll, insert, update } from '../../db/database.handler';
import { BattalionItem } from '../db_items/battalion.item';
import { Export } from './core/export.item';
import { Save } from './core/save.item';
import * as conf from '../../db/database.config.json';
import { ArmyItem } from '../db_items/army.item';
import { BattalionPacket } from '../packets/battalion.packet';
import { ResourceItem } from '../db_items/resource.item';
import { ResourcePacket } from '../packets/resource.packet';
import { TileItem } from '../db_items/tile.item';
import { Delete } from './core/delete.item';

export class Battalion implements Export, Save, Delete {
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

    attack: number;
    defense: number;
    speed: number;
    carry: number;
    build: number;

    private remainingArmor: number = 0;
    private remainingHP: number = 0;
    private totalHP: number;
    private totalArmor: number;
    public preBattleSize: number;
    public isDefender: boolean = false;

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
        this.attack = 0;
        this.defense = 0;
        this.speed = 0;
        this.carry = 0;
        this.build = 0;
        this.totalArmor = 0;
        this.totalHP = 0;
        this.preBattleSize = this.size;
    }
    async deleteItem() {
        await deleteItem(conf.tables.battalion, new BattalionItem({id: this.id}));
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

    async load() {
        const resources = await fetchAll<ResourceItem>(conf.tables.resources);
        this.attack = await this.calcAttackValue(resources);
        this.defense = await this.calcDefenseValue(resources);
        this.speed = await this.calcSpeedValue(resources);
        this.carry = await this.calcCarryValue(resources);
        this.build = await this.calcBuildValue(resources);
        this.totalArmor = this.defense / this.size;
        this.totalHP = 3;
    }
    
    async weightStatsByTile(x, y): Promise<void> {
        const tile = (await fetch<TileItem>(conf.tables.tile, new TileItem({x: x, y: y}))).pop();
        if (tile) {
            if (this.isDefender) {
                this.totalArmor = Math.round(20 * (this.defense / this.size) * (1 + (tile.favorable_terrain_level * 0.05)));
                this.defense = this.totalArmor * this.size;
                this.attack *= 20;
                this.totalHP *= 20;
            } else {
                this.totalArmor *= 20;
                this.defense = this.totalArmor * this.size;
                this.attack *= 20;
                this.totalHP *= 20;
            }
        }
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

    
    async calcAttackValue(resources: ResourceItem[]): Promise<number> {
        let attack = 1;
        if (this.WEAPON_1H) attack += (this.getResource(resources, this.WEAPON_1H) as ResourceItem).attack;
        if (this.WEAPON_2H) attack += (this.getResource(resources, this.WEAPON_2H) as ResourceItem).attack;
        if (this.OFF_HAND) attack += (this.getResource(resources, this.OFF_HAND) as ResourceItem).attack;
        if (this.TOOL) attack += (this.getResource(resources, this.TOOL) as ResourceItem).attack;
        return attack * this.size;
    }

    async calcDefenseValue(resources: ResourceItem[]): Promise<number> {
        let defense = 1;
        if (this.ARMOR) defense += (this.getResource(resources, this.ARMOR) as ResourceItem).defense;
        if (this.WEAPON_1H) defense += (this.getResource(resources, this.WEAPON_1H) as ResourceItem).defense;
        if (this.WEAPON_2H) defense += (this.getResource(resources, this.WEAPON_2H) as ResourceItem).defense;
        if (this.OFF_HAND) defense += (this.getResource(resources, this.OFF_HAND) as ResourceItem).defense;
        if (this.TOOL) defense += (this.getResource(resources, this.TOOL) as ResourceItem).defense;
        return defense * this.size;
    }
    
    async calcSpeedValue(resources: ResourceItem[]): Promise<number> {
        let speed = 10;
        if (this.ARMOR) speed += (this.getResource(resources, this.ARMOR) as ResourceItem).speed;
        if (this.WEAPON_1H) speed += (this.getResource(resources, this.WEAPON_1H) as ResourceItem).speed;
        if (this.WEAPON_2H) speed += (this.getResource(resources, this.WEAPON_2H) as ResourceItem).speed;
        if (this.OFF_HAND) speed += (this.getResource(resources, this.OFF_HAND) as ResourceItem).speed;
        if (this.TOOL) speed += (this.getResource(resources, this.TOOL) as ResourceItem).speed;
        if (this.horse) speed += (this.getResource(resources, 6) as ResourceItem).speed;
        if (this.cart) speed += (this.getResource(resources, 5) as ResourceItem).speed;
        return speed;
    }

    async calcCarryValue(resources: ResourceItem[]): Promise<number> {
        let carry = 20;
        if (this.ARMOR) carry += (this.getResource(resources, this.ARMOR) as ResourceItem).carry;
        if (this.WEAPON_1H) carry += (this.getResource(resources, this.WEAPON_1H) as ResourceItem).carry;
        if (this.WEAPON_2H) carry += (this.getResource(resources, this.WEAPON_2H) as ResourceItem).carry;
        if (this.OFF_HAND) carry += (this.getResource(resources, this.OFF_HAND) as ResourceItem).carry;
        if (this.TOOL) carry += (this.getResource(resources, this.TOOL) as ResourceItem).carry;
        if (this.horse) carry += (this.getResource(resources, 6) as ResourceItem).carry;
        if (this.cart) carry += (this.getResource(resources, 5) as ResourceItem).carry;
        return carry * this.size;
    }

    async calcBuildValue(resources: ResourceItem[]): Promise<number> {
        let build = 1;
        if (this.ARMOR) build += (this.getResource(resources, this.ARMOR) as ResourceItem).build;
        if (this.WEAPON_1H) build += (this.getResource(resources, this.WEAPON_1H) as ResourceItem).build;
        if (this.WEAPON_2H) build += (this.getResource(resources, this.WEAPON_2H) as ResourceItem).build;
        if (this.OFF_HAND) build += (this.getResource(resources, this.OFF_HAND) as ResourceItem).build;
        if (this.TOOL) build += (this.getResource(resources, this.TOOL) as ResourceItem).build;
        if (this.horse) build += (this.getResource(resources, 6) as ResourceItem).build;
        if (this.cart) build += (this.getResource(resources, 5) as ResourceItem).build;
        return build * this.size;
    }

    private getResource(resources: ResourceItem[], id: number): ResourceItem | undefined {
        for (const res of resources) {
            if (res.id) {
                if (+res.id == id) {
                    return res;
                }
            }
        }
    }


    recieveDmg(dmg: number): void {
        if (this.size == 0) {
            return;
        }
        let initialSize = this.size;
        // console.log('applying dmg', dmg)
        let remainingDmg = dmg;
        if (this.remainingArmor == 0) {
            // console.log('\t+armor', this.defense / this.size, this.defense, this.size)
            this.remainingArmor = this.totalArmor;
        }
        if (this.remainingHP == 0) {
            this.remainingHP = this.totalHP;
        }
        while (remainingDmg > 0 && this.size > 0) {
            // absorb dmg counter and repeat while loop
            if (this.remainingArmor > 0) {
                this.remainingArmor -= 1;
                this.defense -= 1
                remainingDmg -= 1;
                continue;
            }
            // when out od armor, dmg the defender
            this.remainingHP -= 1;
            remainingDmg -= 1;
            //if the dude is dead, replace him with the next dude in the line
            if (this.remainingHP == 0) {
                this.size -= 1;
                this.remainingHP = this.totalHP;
                if (this.size > 0) {
                    // console.log('\t\teplenishing armor', this.defense / (this.size), this.defense, this.size)
                    this.remainingArmor = this.totalArmor;
                }
            }
        }
        console.log(`Recieved ${dmg} dmg: (ABSORB: ${this.totalArmor * (initialSize - this.size) - this.remainingArmor}) ${initialSize} -> ${this.size} (${this.id.substr(0, 5)})`)
    }
}