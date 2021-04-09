import { DbItem } from './core/db.item';
export class BaseTypeItem extends DbItem {
	
    tag: string;
	display_name: string;
    build: number;
    wood: number;
    stone: number;
    ore: number;
    speed: number;
    defense: number;
    harvestable: number;
    vision: number;

	constructor(data: any) {
		super(data);
		this.tag = data.tag;
		this.display_name = data.display_name;
		this.build = data.build;
		this.wood = data.wood;
		this.stone = data.stone;
		this.ore = data.ore;
		this.speed = data.speed;
		this.defense = data.defense;
		this.harvestable = data.harvestable;
		this.vision = data.vision;
		
	}
}