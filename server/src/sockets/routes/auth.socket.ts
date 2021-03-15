import { fetch, insert } from '../../db/database.handler';
import { User } from '../../models/db_items/user.item';
import { CredentialsPacket } from '../../models/packets/credentials.packet';
import { SocketHandler } from '../handler.socket';
import * as conf from '../../db/database.config.json';
import { LoginPacket } from '../../models/packets/login.packet';

export function appendAuth (socket) {

    // socket must emit a name of player
    socket.on('LOGIN', async (credentials: CredentialsPacket) => {
        const users: User[] = await fetch<User>(conf.tables.user, new User(credentials));
        const user = users.pop();
        const packet: LoginPacket = {
            success: false,
            username: credentials.username,
        };
        if (user) {
            packet.success = SocketHandler.login(socket, credentials.username);
            if (packet.success) {
                console.log(`User logged in (${user.username}: ${user.id})`);
                socket.emit('GREET', 'Hello ' + credentials.username + '! Join a room or host a game!');
            }
        }
        socket.emit('LOGIN', packet);
    });

    socket.on('REGISTER', async (credentials: CredentialsPacket) => {
        await insert<User>(conf.tables.user, new User(credentials).generateId());
        const users: User[] = await fetch<User>(conf.tables.user, new User(credentials));
        const user = users.pop();
        const packet: LoginPacket = {
            success: false,
            username: credentials.username,
        }
        if (user) {
            packet.success = SocketHandler.login(socket, credentials.username);
            if (packet.success) {
                console.log(`User registered in (${user.username}: ${user.id})`);
                socket.emit('GREET', 'Hello ' + credentials.username + '! Join a room or host a game!');
            }
        }
        socket.emit('LOGIN', packet);
    });

    socket.on('disconnect', async () => {
        SocketHandler.logoutBySocket(socket);
    });
}