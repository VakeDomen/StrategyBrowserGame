import { Injectable } from '@angular/core';
import { UserPacket } from '../models/packets/user.packet';

@Injectable({
  providedIn: 'root'
})
export class CacheService {

  private users: any;

  constructor() {
    this.users = {};
  }

  saveUser(user: UserPacket): void {
    this.users[user.id] = user;;
  }

  getUserById(id: string): UserPacket | undefined {
    return this.users[id];
  }
}
