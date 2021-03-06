import { GameItem } from '../../models/db_items/game.item';
import { fetch, fetchAll } from '../../db/database.handler';
import * as conf from '../../db/database.config.json';
import { TileItem } from '../../models/db_items/tile.item';
import { MapPacket } from '../../models/packets/map.packet';
import { PlayerItem } from '../../models/db_items/player.item';
import { PlayerPacket } from '../../models/packets/player.packet';
import { Tile } from '../../models/game_models/tile.game';
import { ArmyItem } from '../../models/db_items/army.item';
import { Army } from '../../models/game_models/army.game';
import { ArmyPacket } from '../../models/packets/army.packet';
import { UserPacket } from '../../models/packets/user.packet';
import { UserItem } from '../../models/db_items/user.item';
import { User } from '../../models/game_models/user.game';
import { ArmyMovementPacket } from '../../models/packets/army-movement.packet';
import { playersOfSocket } from '../../helpers/user.helper';
import { ArmyMoveEvent } from '../../models/events/army-move.event';
import { SocketHandler } from '../handler.socket';
import { ResourcePacket } from '../../models/packets/resource.packet';
import { Base } from '../../models/game_models/base.game';
import { BaseItem } from '../../models/db_items/base.item';
import { BasePacket } from '../../models/packets/base.packet';
import { BaseTypePacket } from '../../models/packets/base-type.packet';
import { BuildOrderPacket } from '../../models/packets/build-order.packet';
import { BaseTypeItem } from '../../models/db_items/base-type.item';
import { ArmyBaseBuildEvent } from '../../models/events/army-build-base.event';
import { EventItem } from '../../models/db_items/event.item';
import { EventFactory } from '../../helpers/event.factory';
import { ReportItem } from '../../models/db_items/report.item';
import { Report } from '../../models/game_models/report.game';

export function applyGameSockets(socket) {
    
    socket.on('GET_MAP', async (game_id: string) => {
        const games: GameItem[] = await (await fetch<GameItem>(conf.tables.game, new GameItem({id: game_id})));
        const game = games.pop();
        if (game) {
            const tiles: TileItem[] = await fetch<TileItem>(conf.tables.tile, new TileItem({game_id: game.id}));
            socket.emit('GET_MAP', {
                game_id: game.id,
                radius: game.map_radius,
                // tiles: tiles
                tiles: tiles.map((tile: TileItem) => new Tile(tile).exportPacket()),
                tile_types: await fetchAll(conf.tables.tile_types)
            } as MapPacket);
        } else {
            socket.emit('GAME_NOT_EXIST', null);
        }
    });

    socket.on('GET_RESOURCE_TYPES', async () => {
        socket.emit('GET_RESOURCE_TYPES', await fetchAll(conf.tables.resources) as ResourcePacket[]);
    })    
    
    socket.on('GET_BASE_TYPES', async () => {
        socket.emit('GET_BASE_TYPES', await fetchAll(conf.tables.base_types) as BaseTypePacket[]);
    })

    socket.on('GET_PLAYERS', async (game_id: string) => {
        const games: GameItem[] = await (await fetch<GameItem>(conf.tables.game, new GameItem({id: game_id})));
        const game = games.pop();
        if (game) {
            const players: PlayerItem[] = await fetch<PlayerItem>(conf.tables.player, new PlayerItem({game_id: game_id}));
            const packet: PlayerPacket[] = players.map((player: PlayerItem) => player as PlayerPacket);
            socket.emit('GET_PLAYERS', packet);
        } else {
            socket.emit('GAME_NOT_EXIST', null);
        }
    });

    socket.on('GET_ARMIES', async (game_id: string) => {
        const games: GameItem[] = await (await fetch<GameItem>(conf.tables.game, new GameItem({id: game_id})));
        const game = games.pop();
        if (game) {
            const players: PlayerItem[] = await fetch<PlayerItem>(conf.tables.player, new PlayerItem({game_id: game_id}));
            const playerArmies: ArmyItem[][] = await Promise.all(players.map(async (player: PlayerItem) => {
                return await fetch<ArmyItem>(conf.tables.army, new ArmyItem({player_id: player.id}));
            }));
            const armies: Army[] = [];
            for (const playerArmy of playerArmies) {
                for (const army of playerArmy) {
                    armies.push(new Army(army));
                }
            }
            await Promise.all(armies.map(async (army: Army) => await army.load()));
            const packet: ArmyPacket[] = armies.map((army: Army) =>  army.exportPacket());
            socket.emit('GET_ARMIES', packet);
        } else {
            socket.emit('GAME_NOT_EXIST', null);
        }
    });

    socket.on('GET_BASES', async (game_id: string) => {
        const games: GameItem[] = await (await fetch<GameItem>(conf.tables.game, new GameItem({id: game_id})));
        const game = games.pop();
        if (game) {
            const players: PlayerItem[] = await fetch<PlayerItem>(conf.tables.player, new PlayerItem({game_id: game_id}));
            const playerBases: BaseItem[][] = await Promise.all(players.map(async (player: PlayerItem) => {
                return await fetch<BaseItem>(conf.tables.bases, new BaseItem({player_id: player.id}));
            }));
            const bases: Base[] = [];
            for (const playerBase of playerBases) {
                for (const base of playerBase) {
                    bases.push(new Base(base));
                }
            }
            const packet: BasePacket[] = bases.map((base: Base) =>  base.exportPacket());
            socket.emit('GET_BASES', packet);
        } else {
            socket.emit('GAME_NOT_EXIST', null);
        }
    });

    socket.on('GET_GAME_USERS', async (game_id: string) => {
        const games: GameItem[] = await (await fetch<GameItem>(conf.tables.game, new GameItem({id: game_id})));
        const game = games.pop();
        if (!game) {
            socket.emit('GAME_NOT_EXIST', null);   
        }
        const players: PlayerItem[] = await fetch<PlayerItem>(conf.tables.player, new PlayerItem({game_id: game_id}));
        if (!players.length) {
            socket.emit('PLAYERS_NOT_EXIST', null);   
        }
        const users: User[] = [];
        await Promise.all(players.map(async (player: PlayerItem) => {
            const user = (await fetch<UserItem>(conf.tables.user, new UserItem({id: player.user_id}))).pop();
            if (user) {
                users.push(new User(user));
            }
        }))
        const packet: UserPacket[] = users.map((user: User) =>  user.exportPacket());
        socket.emit('GET_GAME_USERS', packet);
    });

    socket.on('ARMY_MOVE', async (packet: ArmyMovementPacket) => {
        const players = await playersOfSocket(socket);
        if (!players) {
            return;
        }
        let player: PlayerItem | undefined;
        for (const pl of players) {
            if (pl.game_id == packet.game_id) {
                player = pl;
                break;
            }
        }
        if (!player) {
            socket.emit('PLAYER_NOT_EXIST', null); 
            return;
        }
        const army = await fetch<ArmyItem>(conf.tables.army, new ArmyItem({id: packet.army_id, player_id: player.id}));
        if (!army) {
            socket.emit('ARMY_NOT_EXIST', null); 
            return;
        }
        const evetTrigger = new Date();
        evetTrigger.setSeconds(evetTrigger.getSeconds() + 5);
        const event = new ArmyMoveEvent({
            game_id: packet.game_id,
            player_id: player.id,
            trigger_time: evetTrigger.getTime(),
            army_id: packet.army_id,
            nextTiles: packet.tiles
        });
        const game = SocketHandler.getGameById(packet.game_id);
        if (game) {
            await event.saveItem();
            game.pushEvent(event);
            socket.emit('QUEUED_EVENT', event.exportPacket());
        } 
    });


    socket.on('BUILD_BASE_ORDER', async (packet: BuildOrderPacket) => {
        const players = await playersOfSocket(socket);
        const player = players?.pop();
        if (!player) {
            socket.emit('PLAYER_NOT_EXIST', null);
            return;
        }
        const armyItem = (await fetch<ArmyItem>(conf.tables.army, new ArmyItem({id: packet.army_id, player_id: player.id}))).pop();
        if (!armyItem) {
            socket.emit('ARMY_NOT_EXIST', null); 
            return;
        }
        const baseType = (await fetch<BaseTypeItem>(conf.tables.base_types, new BaseTypeItem({id: packet.base_type_id}))).pop();
        if (!baseType) {
            socket.emit('BASE_TYPE_NOT_EXIST', null); 
            return;
        }
        const army = new Army(armyItem);
        await army.load();
        if (!await army.canBuild(baseType)) {
            socket.emit('BUILD_BASE_ORDER_REJECTED', null); 
            return;
        }
        const game = SocketHandler.getGameById(packet.game_id);
        if (game) {
            const event = new ArmyBaseBuildEvent({
                game_id: packet.game_id,
                player_id: player.id,
                army_id: packet.army_id,
                x: packet.x,
                y: packet.y,
                base_type_id: packet.base_type_id,
            });
            await event.calculateTriggerTime();
            await event.saveItem()
            game.pushEvent(event);
            socket.emit('QUEUED_EVENT', event.exportPacket());
        } 
    });

    socket.on('GET_EVENTS', async (game_id: string) => {
        const games: GameItem[] = await (await fetch<GameItem>(conf.tables.game, new GameItem({id: game_id})));
        const game = games.pop();
        if (!game) {
            socket.emit('GAME_NOT_EXIST', null);   
        }
        const eventItems = await fetch<EventItem>(conf.tables.event, new EventItem({game_id: game_id}));
        socket.emit('GET_EVENTS', await Promise.all(eventItems.map(async (e: EventItem) => (await EventFactory.createEvent(new EventItem(e)))?.exportPacket())));
    });


    socket.on('GET_REPORTS', async (player_id: string) => {
        const players: PlayerItem[] = await fetch<PlayerItem>(conf.tables.player, new PlayerItem({id: player_id}));
        if (!players.length) {
            socket.emit('PLAYERS_NOT_EXIST', null);   
        }
        
        const items = await fetch<ReportItem>(conf.tables.reports, new ReportItem({player_id: player_id}));
        socket.emit('GET_REPORTS', await Promise.all(items.map(async (e: ReportItem) => new Report(e).exportPacket())));
    });

}