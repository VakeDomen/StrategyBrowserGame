import { SocketHandler } from '../handler.socket';
import { Socket } from 'socket.io';
import { fetch, fetchAll } from '../../db/database.handler';
import * as conf from '../../db/database.config.json';
import { User } from '../../models/db_items/user.item';
import { UserPacket } from '../../models/packets/user.packet';

export function applyUserSockets(socket: Socket) {

    socket.on('GET_USER', async (id: string) => {
        const users = await fetch<User>(conf.tables.user, new User({id: id}));
        const user = users.pop();
        const packet: UserPacket = {
            id: '',
            username: '',
        }
        if (user) {
            packet.id = user.id as string;
            packet.username = user.username;
        }
        socket.emit('GET_USER', packet);
    });


    socket.on('GET_USERS', async () => {
        const users = await fetchAll<User>(conf.tables.user);
        const packet: UserPacket[] = users.map((user: User) => {
            return {
                id: user.id,
                username: user.username,
            } as UserPacket
        });
        socket.emit('GET_USERS', packet);
    });
}