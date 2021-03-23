import { fetch, update } from "../../db/database.handler";
import { Event } from "./core/event";
import * as conf from "../../db/database.config.json";
import { ArmyItem } from "../db_items/army.item";
import { SocketHandler } from "../../sockets/handler.socket";
import { UserItem } from "../db_items/user.item";
import { PlayerItem } from "../db_items/player.item";

export class ArmyMoveEvent extends Event {
    constructor(data) {
        super(data);
    }

    async trigger(): Promise<Event | undefined> {
        const body: any = JSON.parse(JSON.stringify(this.body));
        const army = (await fetch<ArmyItem>(conf.tables.army, new ArmyItem({id: body.army_id}))).pop();
        if (army) {
            const initiator: PlayerItem | undefined = (await fetch<PlayerItem>(conf.tables.player, new PlayerItem({id: body.player_id}))).pop();
            if (initiator) {
                army.x = body.x;
                army.y = body.y;
                await update(conf.tables.army, new ArmyItem(army));
                const socket = SocketHandler.usersConnectionMap.get(initiator.user_id);
                SocketHandler.broadcastToGame(body.game_id, 'ARMY_MOVE_EVENT', body);
            }
        }
        return;
    }
}