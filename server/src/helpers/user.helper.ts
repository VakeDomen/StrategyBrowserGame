import { Socket } from "socket.io";
import { PlayerItem } from "../models/db_items/player.item";
import { SocketHandler } from "../sockets/handler.socket";
import * as conf from '../db/database.config.json';
import { fetch } from "../db/database.handler";


export async function playersOfSocket(socket: Socket): Promise<PlayerItem[] | undefined> {
    const id = SocketHandler.connectionUserMap.get(socket);
    if (!id) {
        socket.emit('UNAUTHORIZED', null);
        return undefined;
    }
    return await fetch<PlayerItem>(conf.tables.player, new PlayerItem({user_id: id}));
    
}