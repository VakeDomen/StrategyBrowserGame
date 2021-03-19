import { DbItem } from "../../db_items/core/db.item";

export abstract class Export {
    abstract exportItem(): DbItem;
    abstract exportPacket(): any;
}