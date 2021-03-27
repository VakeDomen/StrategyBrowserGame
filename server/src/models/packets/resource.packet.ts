export interface ResourcePacket {
    id: number;
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
}