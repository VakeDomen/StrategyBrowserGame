import { SocketHandler } from '../handler.socket';
import { Game } from '../../models/game_models/game.game';
import { v4 as uuidv4 } from 'uuid';
import { GameItem } from '../../models/db_items/game.item';
import { PlayerItem } from '../../models/db_items/player.item';
import { insert, fetch } from '../../db/database.handler';
import * as conf from '../../db/database.config.json';

export function rooms(socket) {
    
    socket.on('LOBBY_GAMES', async (futureFilter: any) => {
        console.log(SocketHandler.games)
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

    socket.on('STARTED_GAMES', async () => {
        const players = await fetch<PlayerItem>(conf.tables.player, new PlayerItem({user_id: SocketHandler.connectionPlayerMap.get(socket)}));
        let games: GameItem[] = [];
        if (players) {
            games = await Promise.all(players.map(async (player: PlayerItem) => {
                return (await fetch<GameItem>(conf.tables.game, new GameItem({id: player.game_id}))).pop()
            })) as GameItem[];
            games = games.filter((game) => !!game);
        }
        await Promise.all(games.map(async (game: any) => {
            game.players = await fetch<PlayerItem>(conf.tables.player, new PlayerItem({game_id: game.id}));
        }));
        socket.emit('STARTED_GAMES', games);
    })

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
        const user = SocketHandler.connectionPlayerMap.get(socket);
        if (user) {
            for (const game of SocketHandler.games) {
                if (game.id === id && user !== game.host) {
                    game.players.push(user);
                    socket.join(game.id);
                    SocketHandler.io.to(game.id).emit('LOBBY_JOIN_GAME', game);
                }
            }
        }
        if (!user) {
            socket.emit('USER_NOT_EXIST', null);
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
        if (!player) {
            socket.emit('USER_NOT_EXIST', null);
        }
        if (!game) {
            socket.emit('GAME_NOT_EXIST', null);
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
                const players: PlayerItem[] = game.players.map((id: string) => {
                    const player = new PlayerItem({
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
                await Promise.all(players.map((player: PlayerItem) => {
                    return insert(conf.tables.player, player);
                }));
                await game.generateMap();
                SocketHandler.io.to(game.id).emit("LOBBY_START_GAME", game);
            }
        }
        if (!player) {
            socket.emit('USER_NOT_EXIST', null);
        }
        if (!game) {
            socket.emit('GAME_NOT_EXIST', null);
        }
    });
}