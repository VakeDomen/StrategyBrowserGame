import { deleteItem, fetch } from "../../db/database.handler";
import { Event } from "./core/event";
import * as conf from "../../db/database.config.json";
import { ArmyItem } from "../db_items/army.item";
import { SocketHandler } from "../../sockets/handler.socket";
import { PlayerItem } from "../db_items/player.item";
import { ArmyMoveEventPacket } from "../packets/move-army.event.packet";
import { EventItem } from "../db_items/event.item";
import { Army } from "../game_models/army.game";
import { ArmyBattleEvent } from "./army-battle.event";

export class ArmyMoveEvent extends Event {
    nextTiles: [number, number][];
    army_id: string;

    constructor(data: any) {
        super(data);
        this.event_type = 'ARMY_MOVE';
        this.army_id = data.army_id;
        this.nextTiles = data.nextTiles;
    }

    async trigger(): Promise<Event[] | undefined> {
        const armyItem = (await fetch<ArmyItem>(conf.tables.army, new ArmyItem({id: this.army_id}))).pop();
        const chainEvents: Event[] = [];
        if (!armyItem) {
            await deleteItem(conf.tables.event, new EventItem({id: this.id}));
            return undefined;
        }
        const army = new Army(armyItem);
        await army.load();
        const initiator: PlayerItem | undefined = (await fetch<PlayerItem>(conf.tables.player, new PlayerItem({id: this.player_id}))).pop();
        if (initiator) {
            const newCoords = this.nextTiles.shift();
            if (newCoords) {
                army.x = newCoords[0];
                army.y = newCoords[1];
                const armiesOnTargetField = await fetch<ArmyItem>(conf.tables.army, new ArmyItem({x: newCoords[0], y: newCoords[1]}));
                if (armiesOnTargetField.length) {
                    for (const occupArmy of armiesOnTargetField) {
                        if (army.id != occupArmy.id) {
                            chainEvents.push(new ArmyBattleEvent({
                                game_id: this.game_id,
                                trigger_time: new Date().getTime(),
                                initiator: army.id,
                                defender: occupArmy.id
                            }));
                        }
                    }
                }
            }
            const packet: ArmyMoveEventPacket = {
                id: this.id,
                event_type: this.event_type,
                trigger_time: this.trigger_time,
                army_id: this.army_id,
                x: army.x,
                y: army.y,
            }
            await army.saveItem();
            await deleteItem(conf.tables.event, new EventItem({id: this.id}));
            SocketHandler.broadcastToGame(this.game_id, 'ARMY_MOVE_EVENT', packet);
        }
        const chainEvents2 = await this.chainEvent();
        if (chainEvents.length && chainEvents2) {
            return [...chainEvents, ...chainEvents2];
        }
        if (chainEvents.length) {
            return chainEvents;
        } 
        if (chainEvents2) {
            return chainEvents2;
        }
        return undefined;
    }

    private async chainEvent(): Promise<ArmyMoveEvent[] | undefined> {
        if (this.nextTiles.length) {
            const eventTrigger = new Date();
            eventTrigger.setSeconds(eventTrigger.getSeconds() + 5);
            const event = new ArmyMoveEvent({
                game_id: this.game_id,
                player_id: this.player_id,
                army_id: this.army_id,
                event_type: this.event_type,
                trigger_time: eventTrigger.getTime(),
                nextTiles: this.nextTiles,
            });
            await event.saveItem();
            SocketHandler.broadcastToGame(this.game_id, 'QUEUED_EVENT', event.exportPacket());
            return [event];
        }
        return undefined;
    }

    setBody() {
        this.body = {
            nextTiles: this.nextTiles,
            army_id: this.army_id
        };
    }
}