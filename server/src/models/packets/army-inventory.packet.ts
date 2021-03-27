export interface ArmyInventoryPacket {
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
}