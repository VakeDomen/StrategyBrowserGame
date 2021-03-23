import { fetch, insert } from '../../db/database.handler';
import { UserItem } from '../../models/db_items/user.item';
import { CredentialsPacket } from '../../models/packets/credentials.packet';
import { SocketHandler } from '../handler.socket';
import * as conf from '../../db/database.config.json';
import { LoginPacket } from '../../models/packets/login.packet';
import { on } from 'node:events';

export function appendAuth (socket) {

    // socket must emit a name of player
    socket.on('LOGIN', async (credentials: CredentialsPacket) => {
        const users: UserItem[] = await fetch<UserItem>(conf.tables.user, new UserItem(credentials));
        const user = users.pop();
        const packet: LoginPacket = {
            success: false,
            id: '',
            username: credentials.username,
        };
        if (user) {
            packet.id = user.id as string;
            packet.success = SocketHandler.login(socket, packet.id);
            if (packet.success) {
                console.log(`User logged in (${user.username}: ${user.id})`);
                socket.emit('GREET', 'Hello ' + credentials.username + '! Join a room or host a game!');
            }
        }
        socket.emit('LOGIN', packet);
    });

    socket.on('REGISTER', async (credentials: CredentialsPacket) => {
        const existing: UserItem[] = await fetch<UserItem>(conf.tables.user, new UserItem({username: credentials.username}));
        if (existing.length > 0) {
            socket.emit('LOGIN', {
                success: false,
                id: '',
                username: credentials.username,
            } as LoginPacket);
            return;
        }
        await insert<UserItem>(conf.tables.user, new UserItem(credentials).generateId());
        const users: UserItem[] = await fetch<UserItem>(conf.tables.user, new UserItem(credentials));
        const user = users.pop();
        const packet: LoginPacket = {
            success: false,
            id: '',
            username: credentials.username,
        }
        if (user) {
            packet.id = user.id as string;
            packet.success = SocketHandler.login(socket, packet.id);
            if (packet.success) {
                console.log(`User registered in (${user.username}: ${user.id})`);
                socket.emit('GREET', 'Hello ' + credentials.username + '! Join a room or host a game!');
            }
        }
        socket.emit('LOGIN', packet);
    });
    
    socket.on('PING', async (id: string) => {
        const users: UserItem[] = await fetch<UserItem>(conf.tables.user, new UserItem({id: id}));
        const user = users.pop();
        if (!user) {
            socket.emit('USER_NOT_EXIST');
            return;
        }
        const success = SocketHandler.login(socket, id);
        console.log(success);
        if (success || SocketHandler.playerConnectionMap.get(id) != socket) {
            SocketHandler.playerConnectionMap.set(id, socket);
            socket.emit('GREET', 'Hello ' + user.username + '! Join a room or host a game!');
            console.log('emiting pong')
            socket.emit('PONG', {
                success: success,
                id: id,
                username: user.username
            } as LoginPacket)
        } else {
            socket.emit('UNAUTHORIZED', null);
        }
    });

    socket.on('disconnect', async () => {
        SocketHandler.logoutBySocket(socket);
    });
}