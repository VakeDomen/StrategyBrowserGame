import { DbItem } from "../db_items/core/db.item";
import { UserItem } from "../db_items/user.item";
import { UserPacket } from "../packets/user.packet";
import { Export } from "./core/export.item";

export class User implements Export {
    id: string;
    username: string;

    constructor(data: any) {
        this.id = data.id;
        this.username = data.username;
    }

    exportItem(): DbItem {
        return new UserItem(this);
    }
    
    exportPacket() {
        return {
            id: this.id,
            username: this.username,
        } as  UserPacket;
    }

}