import { SocketHandler } from '../handler.socket';
import { Game } from '../../models/game_models/game.game';
import { v4 as uuidv4 } from 'uuid';
import { GameItem } from '../../models/db_items/game.item';
import { Player } from '../../models/db_items/player.item';
import { insert } from '../../db/database.handler';
import * as conf from '../../db/database.config.json';

export function rooms(socket) {
    
    socket.on('LOBBY_GAMES', async (futureFilter: any) => {
        socket.emit('LOBBY_GAMES', SocketHandler.games);
    });

    socket.on('LOBBY_GAME', (id: string) => {
        for (const game of SocketHandler.games) {
            if (game.id === id) {
                socket.emit('LOBBY_GAME', game);
                break;
            }
        }
    });

    socket.on('LOBBY_HOST_GAME', async (mode: string) => {
        const game = new Game({
            id: uuidv4(),
            host: SocketHandler.connectionPlayerMap.get(socket),
            players: [SocketHandler.connectionPlayerMap.get(socket)],
            running: false,
        });
        socket.join(game.id);
        SocketHandler.games.push(game);
        SocketHandler.broadcast('LOBBY_GAMES', SocketHandler.games);
    });

    socket.on('LOBBY_JOIN_GAME', (id: string) => {
        const player = SocketHandler.connectionPlayerMap.get(socket);
        if (player) {
            for (const game of SocketHandler.games) {
                if (game.id === id && player !== game.host) {
                    game.players.push(player);
                    socket.join(game.id);
                    SocketHandler.io.to(game.id).emit('LOBBY_JOIN_GAME', game);
                }
            }
        }
    });

    socket.on('LOBBY_LEAVE_GAME', (id: string) => {
        const player = SocketHandler.connectionPlayerMap.get(socket);
        const game = SocketHandler.getGameById(id);
        if (player && game) {
            SocketHandler.removePlayerFromGames(player);
            SocketHandler.io.to(game.id).emit('LOBBY_GAME', game);
            socket.leave(game.id);
        }
    });

    socket.on('LOBBY_START_GAME', async (id: string) => {
        const player = SocketHandler.connectionPlayerMap.get(socket);
        const game = SocketHandler.getGameById(id);
        if (player && game) {
            if (player === game.host) {
                game.running = true;
                game.generateSeed();
                const gameMeta = game.exportItem();
                const players: Player[] = game.players.map((id: string) => {
                    const player = new Player({
                        user_id: id,
                        game_id: gameMeta.id,
                        defeated: false,
                        defeated_at: null,
                    });
                    player.generateId();
                    return player;
                });
                gameMeta.parseStarted(new Date());
                await insert(conf.tables.game, gameMeta);
                await Promise.all(players.map((player: Player) => {
                    return insert(conf.tables.player, player);
                }));
                await game.generateMap();
                SocketHandler.io.to(game.id).emit("LOBBY_START_GAME", game);
            }
        }
    });
}