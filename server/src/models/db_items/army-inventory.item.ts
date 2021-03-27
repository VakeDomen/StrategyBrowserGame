import { DbItem } from './core/db.item';
export class ArmyInventoryItem extends DbItem {
    
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
        super(data);
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
}