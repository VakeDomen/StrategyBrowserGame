import { Cache } from "src/app/services/cache.service";

export class Battalion {
    id: string;
    army_id: string;
    
    size: number;
    attack: number;
    defense: number;
    speed: number;
    carry: number;
    build: number;

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
        this.attack = this.calcAttackValue();
        this.defense = this.calcDefenseValue();
        this.speed = this.calcSpeedValue();
        this.carry = this.calcCarryValue();
        this.build = this.calcBuildValue();
    }  

    calcAttackValue(): number {
        let attack = 1;
        if (this.WEAPON_1H) attack += Cache.getResource(this.WEAPON_1H).attack;
        if (this.WEAPON_2H) attack += Cache.getResource(this.WEAPON_2H).attack;
        if (this.OFF_HAND) attack += Cache.getResource(this.OFF_HAND).attack;
        if (this.TOOL) attack += Cache.getResource(this.TOOL).attack;
        return attack * this.size;
    }

    calcDefenseValue(): number {
        let defense = 1;
        if (this.ARMOR) defense += Cache.getResource(this.ARMOR).defense;
        if (this.WEAPON_1H) defense += Cache.getResource(this.WEAPON_1H).defense;
        if (this.WEAPON_2H) defense += Cache.getResource(this.WEAPON_2H).defense;
        if (this.OFF_HAND) defense += Cache.getResource(this.OFF_HAND).defense;
        if (this.TOOL) defense += Cache.getResource(this.TOOL).defense;
        return defense * this.size;
    }
    
    calcSpeedValue(): number {
        let speed = 10;
        if (this.ARMOR) speed += Cache.getResource(this.ARMOR).speed;
        if (this.WEAPON_1H) speed += Cache.getResource(this.WEAPON_1H).speed;
        if (this.WEAPON_2H) speed += Cache.getResource(this.WEAPON_2H).speed;
        if (this.OFF_HAND) speed += Cache.getResource(this.OFF_HAND).speed;
        if (this.TOOL) speed += Cache.getResource(this.TOOL).speed;
        if (this.horse) speed += Cache.getResource(6).speed;
        if (this.cart) speed += Cache.getResource(5).speed;
        return speed;
    }

    calcCarryValue(): number {
        let carry = 20;
        if (this.ARMOR) carry += Cache.getResource(this.ARMOR).carry;
        if (this.WEAPON_1H) carry += Cache.getResource(this.WEAPON_1H).carry;
        if (this.WEAPON_2H) carry += Cache.getResource(this.WEAPON_2H).carry;
        if (this.OFF_HAND) carry += Cache.getResource(this.OFF_HAND).carry;
        if (this.TOOL) carry += Cache.getResource(this.TOOL).carry;
        if (this.horse) carry += Cache.getResource(6).carry;
        if (this.cart) carry += Cache.getResource(5).carry;
        return carry * this.size;
    }

    calcBuildValue(): number {
        let build = 1;
        if (this.ARMOR) build += Cache.getResource(this.ARMOR).build;
        if (this.WEAPON_1H) build += Cache.getResource(this.WEAPON_1H).build;
        if (this.WEAPON_2H) build += Cache.getResource(this.WEAPON_2H).build;
        if (this.OFF_HAND) build += Cache.getResource(this.OFF_HAND).build;
        if (this.TOOL) build += Cache.getResource(this.TOOL).build;
        if (this.horse) build += Cache.getResource(6).build;
        if (this.cart) build += Cache.getResource(5).build;
        return build * this.size;
    }

}