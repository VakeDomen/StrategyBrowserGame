import { DbItem } from './core/db.item';
export class PlayerItem extends DbItem {
    
    user_id: string;
    game_id: string;
    color: number;
    defeated: boolean;
    defeated_at: Date;

    constructor(data: any) {
        super(data);
        this.user_id = data.user_id;
        this.game_id = data.game_id;
        this.color = data.color;
        this.defeated = data.defeated;
        this.defeated_at = data.defeated_at;
    }
}