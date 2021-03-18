import { SocketHandler } from '../handler.socket';
import { Game } from '../../models/game_models/game.game';
import { v4 as uuidv4 } from 'uuid';
import { GameItem } from '../../models/db_items/game.item';
import { fetch } from '../../db/database.handler';
import * as conf from '../../db/database.config.json';
import { TileItem } from '../../models/db_items/tile.item';
import { MapPacket } from '../../models/packets/map.packet';
import { PlayerItem } from '../../models/db_items/player.item';
import { PlayersPacket } from '../../models/packets/players.packet';
import { PlayerPacket } from '../../models/packets/player.packet';
import { Tile } from '../../models/game_models/tile.game';
import { TilePacket } from '../../models/packets/tile.packet';

export function applyGameSockets(socket) {
    
    socket.on('GET_MAP', async (game_id: string) => {
        const games: GameItem[] = await (await fetch<GameItem>(conf.tables.game, new GameItem({id: game_id})));
        console.log(games);
        const game = games.pop();
        if (game) {
            const tiles: TileItem[] = await fetch<TileItem>(conf.tables.tile, new TileItem({game_id: game.id}));
            // const gameInstance = new Game(game);
            // gameInstance.generateSeed();
            // await gameInstance.generateMap();
            // let tiles: TilePacket[] = [];
            // for(const row of gameInstance.board.values()) {
            //     for (const tile of row) {
            //         tiles.push(tile as TilePacket);
            //     }
            // }
            socket.emit('GET_MAP', {
                game_id: game.id,
                radius: game.map_radius,
                // tiles: tiles
                tiles: tiles
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
}