import { DbItem } from './core/db.item';

export class BattalionItem extends DbItem {
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
        super(data);
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
}