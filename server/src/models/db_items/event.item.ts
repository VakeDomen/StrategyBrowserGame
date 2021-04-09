import { DbItem } from "./core/db.item";

export class EventItem extends DbItem {
    game_id: string;
    player_id: string;
    event_type: 'ARMY_MOVE' | 'ARMY_BASE_BUILD';
    trigger_time: number;
    body: string;
    
    constructor(data: any) {
        super(data);
        this.game_id = data.game_id;
        this.player_id = data.player_id;
        this.event_type = data.event_type;
        this.trigger_time = data.trigger_time;
        this.body = JSON.stringify(data.body);
    }
}