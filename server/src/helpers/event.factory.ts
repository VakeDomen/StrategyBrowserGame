import { EventItem } from "../models/db_items/event.item";
import { ArmyBaseBuildEvent } from "../models/events/army-build-base.event";
import { ArmyMoveEvent } from "../models/events/army-move.event";
import { Event } from "../models/events/core/event";

export class EventFactory {

    public static async createEvent(item: EventItem): Promise<Event | undefined> {
        let clone, event;
        switch (item.event_type) {
            case 'ARMY_MOVE':
                clone = JSON.parse(JSON.stringify(item));
                clone.army_id = JSON.parse(item.body).army_id;
                clone.nextTiles = JSON.parse(item.body).nextTiles;
                return new ArmyMoveEvent(clone);
            case 'ARMY_BASE_BUILD':
                clone = JSON.parse(JSON.stringify(item));
                clone.army_id = JSON.parse(item.body).army_id;
                clone.x = JSON.parse(item.body).x;
                clone.y = JSON.parse(item.body).y;
                clone.base_type_id = JSON.parse(item.body).base_type_id;
                clone.army_id = JSON.parse(item.body).army_id;
                event = new ArmyBaseBuildEvent(clone);
                await event.calculateTriggerTime();
                return event;
            default:
                return undefined;
        }
    }
}