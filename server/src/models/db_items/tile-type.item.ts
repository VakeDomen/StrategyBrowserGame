import { DbItem } from './core/db.item';

export class TileTypeItem extends DbItem {
    tag: string;
    speed: number;
    food: number;
    wood: number;
    stone: number;
    ore: number;
    defense: number;

    constructor(data: any) {
        super(data);
        this.tag = data.tag;
        this.speed = data.speed;
        this.food = data.food;
        this.wood = data.wood;
        this.stone = data.stone;
        this.ore = data.ore;
        this.defense = data.defense;
    }
}