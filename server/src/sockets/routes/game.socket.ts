import { SocketHandler } from '../handler.socket';
import { Game } from '../../models/game_models/game.game';
import { v4 as uuidv4 } from 'uuid';
import { GameItem } from '../../models/db_items/game.item';
import { fetch } from '../../db/database.handler';
import * as conf from '../../db/database.config.json';
import { TileItem } from '../../models/db_items/tile.item';
import { MapPacket } from '../../models/packets/map.packet';

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
                tiles: tiles
            } as MapPacket);
        } else {
            socket.emit('GAME_NOT_EXIST', null);
        }

        
    });
}