import { deleteItem, fetch } from "../../db/database.handler";
import { PlayerItem } from "../db_items/player.item";
import { Event } from "./core/event";
import * as conf from '../../db/database.config.json';
import { SocketHandler } from "../../sockets/handler.socket";
import { ArmyItem } from "../db_items/army.item";
import { BaseTypeItem } from "../db_items/base-type.item";
import { Army } from "../game_models/army.game";
import { Base } from "../game_models/base.game";
import { BaseItem } from "../db_items/base.item";
import { UserItem } from "../db_items/user.item";
import { TileItem } from "../db_items/tile.item";
import { Tile } from "../game_models/tile.game";
import { EventItem } from "../db_items/event.item";

export class ArmyBaseBuildEvent extends Event {
    x: number;
    y: number;
    base_type_id: number;
    army_id: string;

    static buildTick = 300000;

    constructor(data) {
        super(data);
        this.event_type = 'ARMY_BASE_BUILD';
        this.x = data.x;
        this.y = data.y;
        this.base_type_id = data.base_type_id;
        this.army_id = data.army_id;
        this.trigger_time = data.trigger_time;
    }
    
    async trigger(): Promise<Event[] | undefined> { 
        SocketHandler.broadcastToGame(this.game_id, 'EVENT_TRIGGERED', this.exportPacket());
        await deleteItem(conf.tables.event, new EventItem({id: this.id}));
        const player: PlayerItem | undefined = (await fetch<PlayerItem>(conf.tables.player, new PlayerItem({id: this.player_id}))).pop();
        if (!player) {
            SocketHandler.broadcastToGame(this.game_id, 'PLAYER_NOT_EXIST', null);
            return undefined;
        }
        const user = (await fetch<UserItem>(conf.tables.user, new UserItem({id: player.user_id}))).pop();
        if (!user) {
            SocketHandler.broadcastToGame(this.game_id, 'USER_NOT_EXIST', null);
            return undefined;
        }
        const armyItem = (await fetch<ArmyItem>(conf.tables.army, new ArmyItem({id: this.army_id, player_id: player.id}))).pop();
        if (!armyItem) {
            SocketHandler.broadcastToGame(this.game_id, 'BUILD_BASE_ORDER_REJECTED', null);
            return undefined;
        }
        const tile = (await fetch<TileItem>(conf.tables.tile, new TileItem({x: this.x, y: this.y}))).pop();
        if (!tile) {
            SocketHandler.broadcastToGame(this.game_id, 'BUILD_BASE_ORDER_REJECTED', null);
            return undefined;
        }
        const baseType = (await fetch<BaseTypeItem>(conf.tables.base_types, new BaseTypeItem({id: this.base_type_id}))).pop();
        if (!baseType) {
            SocketHandler.broadcastToGame(this.game_id, 'BUILD_BASE_ORDER_REJECTED', null);
            return undefined;
        }
        const army = new Army(armyItem);
        await army.load();
        if (!army.canBuild(baseType) || !army.inventory) {
            SocketHandler.broadcastToGame(this.game_id, 'BUILD_BASE_ORDER_REJECTED', null);
            return undefined;
        }
        const bases = await fetch<BaseItem>(conf.tables.bases, new BaseItem({player_id: this.player_id}));
        army.inventory.wood -= baseType.wood;
        army.inventory.stone -= baseType.stone;
        army.inventory.ore -= baseType.ore;
        const base = new Base({
            player_id: this.player_id,
            x: this.x,
            y: this.y,
            base_type: this.base_type_id,
            name: escape(`${user.username}'s ${baseType.display_name} ${bases.length + 1}`),
            size: 0,
        });
        await base.saveItem();
        await army.saveItem();
        tile.base = base.id;
        await new Tile(tile).saveItem();
        SocketHandler.broadcastToGame(this.game_id, 'GET_ARMY', army.exportPacket());
        SocketHandler.broadcastToGame(this.game_id, 'BUILD_BASE_ORDER_COMPLETED', base.exportPacket());
        return undefined;
    }

    async calculateTriggerTime(): Promise<void> {
        const now = new Date().getTime();
        const armyItem = (await fetch<ArmyItem>(conf.tables.army, new ArmyItem({id: this.army_id, player_id: this.player_id}))).pop();
        if (!armyItem) {
            SocketHandler.broadcastToGame(this.game_id, 'BUILD_BASE_ORDER_REJECTED', null);
            this.trigger_time = now;
            return;
        }
        const baseType = (await fetch<BaseTypeItem>(conf.tables.base_types, new BaseTypeItem({id: this.base_type_id}))).pop();
        if (!baseType) {
            SocketHandler.broadcastToGame(this.game_id, 'BUILD_BASE_ORDER_REJECTED', null);
            this.trigger_time = now;
            return;
        }
        const army = new Army(armyItem);
        await army.load();
        const requiredBuildUnits = baseType.build;
        const timeInTicks = requiredBuildUnits / army.buildSpeed;
        const timeInSeconds = Math.ceil(ArmyBaseBuildEvent.buildTick * timeInTicks);
        this.trigger_time = now + timeInSeconds;
    }

    setBody() {
        this.body = {
            x: this.x,
            y: this.y,
            base_type_id: this.base_type_id,
            army_id: this.army_id
        };
    }
}