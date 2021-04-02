const fs = require("fs");
const path = require('path');
import { appendAuth } from './routes/auth.socket';
import { rooms } from './routes/rooms.socket';
import { Game } from '../models/game_models/game.game';
import { Socket, Server } from 'socket.io';
import { applyUserSockets } from './routes/users.socket';
import { fetch, fetchAll } from '../db/database.handler';
import * as conf from '../db/database.config.json';
import { GameItem } from '../models/db_items/game.item';
import { PlayerItem } from '../models/db_items/player.item';
import { applyGameSockets } from './routes/game.socket';
import { GamePacket } from '../models/packets/game.packet';
import { BaseItem } from '../models/db_items/base.item';
import { Base } from '../models/game_models/base.game';

export class SocketHandler {

    static io: Server;

    // connected sockets of users
    // Map<key: string, value: Socket>
    static usersConnectionMap = new Map<string, Socket>();
    // Map<key: Socket, value: string>
    static connectionUserMap = new Map<Socket, string>();

    private static games: Game[] = [];

    static async init(io) {
        this.io = io;
        await this.prefillGames();
        io.on('connection', (socket) => {
            appendAuth(socket);
            rooms(socket);
            applyUserSockets(socket);
            applyGameSockets(socket);
        });
    }

    static login(socket: Socket, userId: string): boolean {
        this.usersConnectionMap.set(userId, socket);
        this.connectionUserMap.set(socket, userId);
        this.joinGameRooms(socket, userId);
        return true;
    }

    static logoutBySocket(socket: Socket): void {
        const player = this.connectionUserMap.get(socket);
        if (player) {
            this.usersConnectionMap.delete(player);
            this.connectionUserMap.delete(socket);
            this.removePlayerFromGames(player);
        }
    }

    static async joinGameRooms(socket: Socket, userId: string) {
        const players = await fetch<PlayerItem>(conf.tables.player, new PlayerItem({user_id: userId}));
        players.forEach((player: PlayerItem) => {
            socket.join(player.game_id);
        });
        
    }

    static removePlayerFromGames(player: string): void {
        for (const game of this.games) {
            if (game.players.includes(player)) {
                game.players.splice(game.players.indexOf(player), 1);
                SocketHandler.broadcast('LOBBY_GAMES', SocketHandler.getGamesPackets());
            }
        }
    }

    static getGameById(id: string): Game | undefined {
        for (const game of this.games) {
            if (game.id == id) {
                return game;
            }    
        }
    }

    static closeGame(game: Game): void {
        for (const player of game.players) {
            const socket = this.usersConnectionMap.get(player)
            if (socket) {
                socket.emit('GAME_CLOSED', game.id);
            }
        }
        this.games.splice(this.games.indexOf(game), 1);
    }

    static emitToPlayer(recipient: string, key: string, value: any): void {
        const socket = this.usersConnectionMap.get(recipient);
        if (socket) {
            socket.emit(key, value);
        }
    }

    static broadcast(key: string, value: any): void {
        this.io.emit(key, value);
    }

    static broadcastToGame(gameId: string, key: string, value: any): void {
        this.io.to(gameId).emit(key, value);
    }

    static addGame(game: Game): void {
        this.games.push(game);
    }

    static getGamesPackets(): GamePacket[] {
        return this.games.map((game: Game) => game.exportPacket());
    }

    private static async prefillGames(): Promise<void> {
        const games = await fetchAll<GameItem>(conf.tables.game);
        this.games = await Promise.all(games.map(async (gameMeta: GameItem) => {
            const game = new Game(gameMeta);
            const players = await fetch<PlayerItem>(conf.tables.player, new PlayerItem({game_id: game.id}));
            const bases = await Promise.all(players.map(async (pl: PlayerItem) => await fetch<BaseItem>(conf.tables.bases, new BaseItem({player_id: pl.id})))); 
            game.players = players.map((player: PlayerItem) => player.id as string);
            game.bases = [];
            for (const plbases of bases) {
                game.bases.concat(plbases.map((b: BaseItem) => new Base(b)));
            }
            return game;
        }));
        return;
    }
}  