import { EventItem } from "../models/db_items/event.item";
import { ArmyMoveEvent } from "../models/events/army-move.event";
import { Event } from "../models/events/core/event";

export class EventFactory {

    public static createEvent(item: EventItem): Event | undefined {
        switch (item.event_type) {
            case 'ARMY_MOVE':
                const clone = JSON.parse(JSON.stringify(item));
                clone.army_id = JSON.parse(item.body).army_id;
                clone.nextTiles = JSON.parse(item.body).nextTiles;
                return new ArmyMoveEvent(clone);
            default:
                return undefined;
        }
    }
}