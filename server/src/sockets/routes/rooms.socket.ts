import { SocketHandler } from '../handler.socket';
import { Game } from '../../models/game_models/game.game';
import { v4 as uuidv4 } from 'uuid';
import { GameItem } from '../../models/db_items/game.item';
import { PlayerItem } from '../../models/db_items/player.item';
import { insert, fetch } from '../../db/database.handler';
import * as conf from '../../db/database.config.json';
import { StartGamePacket } from '../../models/packets/start-game.packet';
import { GamePacket } from '../../models/packets/game.packet';

export function rooms(socket) {
    
    socket.on('LOBBY_GAMES', async (futureFilter: any) => {
        socket.emit('LOBBY_GAMES', SocketHandler.getGamesPackets());
    });

    socket.on('LOBBY_GAME', (id: string) => {
        const game = SocketHandler.getGameById(id);
        if (game) {
            socket.emit('LOBBY_GAME', game.exportPacket());
        } else {
            socket.emit('GAME_NOT_EXIST', null);
        }
    });

    socket.on('STARTED_GAMES', async () => {
        const players = await fetch<PlayerItem>(conf.tables.player, new PlayerItem({user_id: SocketHandler.connectionUserMap.get(socket)}));
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
    });

    socket.on('GET_GAME', async (id: string) => {
        const players = await fetch<PlayerItem>(conf.tables.player, new PlayerItem({user_id: SocketHandler.connectionUserMap.get(socket)}));
        if (!players) {
            socket.emit('PLAYER_NOT_EXIST', null);
            return;
        }
        const games: GameItem[] = await Promise.all(players.map(async (player: PlayerItem) => {
            return (await fetch<GameItem>(conf.tables.game, new GameItem({id: player.game_id}))).pop()
        })) as GameItem[];
        const game = games.filter((game) => !!game && game.id == id).pop();
        if (!game) {
            socket.emit('GAME_NOT_EXIST', null);
            return;
        }
        const gamePlayers = await fetch<PlayerItem>(conf.tables.player, new PlayerItem({game_id: game.id}));
        socket.emit('GET_GAME', {
            id: id,
            host: game.host,
            name: game.name,
            players: gamePlayers.map((player: PlayerItem) => player.id),
            running: game.running
        } as GamePacket);
    })

    socket.on('LOBBY_HOST_GAME', async (mode: string) => {
        const game = new Game({
            id: uuidv4(),
            host: SocketHandler.connectionUserMap.get(socket),
            players: [SocketHandler.connectionUserMap.get(socket)],
            running: false,
        });
        socket.join(game.id);
        SocketHandler.addGame(game);
        SocketHandler.broadcast('LOBBY_GAMES', SocketHandler.getGamesPackets());
    });

    socket.on('LOBBY_JOIN_GAME', (id: string) => {
        const user = SocketHandler.connectionUserMap.get(socket);
        if (user) {
            const game = SocketHandler.getGameById(id)
            if (game && user !== game.host) {
                game.players.push(user);
                socket.join(game.id);
                SocketHandler.io.to(game.id).emit('LOBBY_JOIN_GAME', game);
            }
        }
        if (!user) {
            socket.emit('USER_NOT_EXIST', null);
        }
    });

    socket.on('LOBBY_LEAVE_GAME', (id: string) => {
        const player = SocketHandler.connectionUserMap.get(socket);
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

    socket.on('LOBBY_START_GAME', async (startGamePacket: StartGamePacket) => {
        const player = SocketHandler.connectionUserMap.get(socket);
        const game = SocketHandler.getGameById(startGamePacket.id);
        if (player && game) {
            if (player === game.host) {
                game.map_radius = startGamePacket.radius;
                game.name = startGamePacket.name;
                game.running = true;
                if (!startGamePacket.seed && startGamePacket.seed != '') {
                    game.generateSeed();
                } else {
                    game.seed = startGamePacket.seed;
                }
                    
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
                await game.generateStartingArmies();
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