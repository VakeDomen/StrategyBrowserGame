import { DbItem } from './core/db.item';

export class ResourceItem extends DbItem {
    tag: string;
    display_name: string;
    resource_type: 'RAW' | 'TRANSPORT' | 'ARMOR' | 'WEAPON_1H' | 'WEAPON_2H' | 'OFFHAND' | 'TOOL';
    equippable: boolean;
    attack: number;
    defense: number;
    speed: number;
    carry: number;
    weight: number;
    food: number;
    wood: number;
    stone: number;
    ore: number;
    build: number;

    constructor(data: any) {
        super(data);
        this.tag = data.tag;
        this.display_name = data.display_name;
        this.resource_type = data.resource_type;
        this.equippable = data.equippable;
        this.attack = data.attack;
        this.speed = data.speed;
        this.carry = data.carry;
        this.weight = data.weight
        this.food = data.food;
        this.wood = data.wood;
        this.stone = data.stone;
        this.ore = data.ore;
        this.defense = data.defense;
        this.build = data.build;
    }
}