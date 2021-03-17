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
import { Player } from '../models/db_items/player.item';
import { applyGameSockets } from './routes/game.socket';

export class SocketHandler {

    static io: Server;

    // connected sockets of players
    // Map<key: string, value: Socket>
    static playerConnectionMap = new Map<string, Socket>();
    // Map<key: Socket, value: string>
    static connectionPlayerMap = new Map<Socket, string>();

    static games: Game[] = [];

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

    static login(socket: Socket, player: string): boolean {
        if (this.playerConnectionMap.get(player)) {
            return false;
        }
        this.playerConnectionMap.set(player, socket);
        this.connectionPlayerMap.set(socket, player);
        return true;
    }

    static logoutBySocket(socket: Socket): void {
        const player = this.connectionPlayerMap.get(socket);
        if (player) {
            this.playerConnectionMap.delete(player);
            this.connectionPlayerMap.delete(socket);
            this.removePlayerFromGames(player);
        }
    }

    static removePlayerFromGames(player: string): void {
        for (const game of this.games) {
            if (game.host === player) {
                this.closeGame(game);
            }
            if (game.players.includes(player)) {
                game.players.splice(game.players.indexOf(player), 1);
                SocketHandler.broadcast('LOBBY_GAMES', SocketHandler.games);
            }
        }
    }

    static getGameById(id: string): Game | undefined {
        for (const game of this.games) {
            if (game.id === id) {
                return game;
            }    
        }
    }

    static closeGame(game: Game): void {
        for (const player of game.players) {
            const socket = this.playerConnectionMap.get(player)
            if (socket) {
                socket.emit('GAME_CLOSED', game.id);
            }
        }
        this.games.splice(this.games.indexOf(game), 1);
    }

    static emitToPlayer(recipient: string, key: string, value: any): void {
        const socket = this.playerConnectionMap.get(recipient);
        if (socket) {
            socket.emit(key, value);
        }
    }

    static broadcast(key: string, value: any): void {
        this.io.emit(key, value);
    }

    private static async prefillGames(): Promise<void> {
        const games = await fetchAll<GameItem>(conf.tables.game);
        this.games = await Promise.all(games.map(async (gameMeta: GameItem) => {
            const game = new Game(gameMeta);
            const players = await fetch<Player>(conf.tables.player, new Player({game_id: game.id}));
            game.players = players.map((player: Player) => player.id as string);
            return game;
        }));
        return;
    }
}  