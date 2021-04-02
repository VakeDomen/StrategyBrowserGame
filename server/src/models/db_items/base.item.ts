import { DbItem } from './core/db.item';
export class BaseItem extends DbItem {
	
	player_id: string;
	x: number;
    y: number;
    base_type: number;

	constructor(data: any) {
		super(data);
		this.player_id = data.player_id;
		this.x = data.x;
        this.y = data.y;
        this.base_type = data.base_type;
	}
}