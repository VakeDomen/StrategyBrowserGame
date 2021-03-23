import { GameItem } from '../../models/db_items/game.item';
import { fetch } from '../../db/database.handler';
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

export function applyGameSockets(socket) {
    
    socket.on('GET_MAP', async (game_id: string) => {
        const games: GameItem[] = await (await fetch<GameItem>(conf.tables.game, new GameItem({id: game_id})));
        console.log(games);
        const game = games.pop();
        if (game) {
            const tiles: TileItem[] = await fetch<TileItem>(conf.tables.tile, new TileItem({game_id: game.id}));
            socket.emit('GET_MAP', {
                game_id: game.id,
                radius: game.map_radius,
                // tiles: tiles
                tiles: tiles.map((tile: TileItem) => new Tile(tile).exportPacket())
            } as MapPacket);
        } else {
            socket.emit('GAME_NOT_EXIST', null);
        }
    });

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
            console.log('armies', playerArmies, armies)
            await Promise.all(armies.map((army: Army) => army.loadBattalions()));

            const packet: ArmyPacket[] = armies.map((army: Army) =>  army.exportPacket());
            socket.emit('GET_ARMIES', packet);
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

    
}