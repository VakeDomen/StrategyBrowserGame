import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { LoginPacket } from '../models/packets/login.packet';
import { UserPacket } from '../models/packets/user.packet';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private name: string | undefined;

  constructor(
    private toastr: ToastrService,
  ) { }

  login(credentials: LoginPacket): void {
    sessionStorage.setItem('credentials', JSON.stringify(credentials))
  }

  logout(): void {
    this.name = undefined;
    this.toastr.success('Logged out!');
  }
  logoutSilent(): void {
    this.name = undefined;
  }

  isLoggedIn(): boolean {
    return sessionStorage.getItem('credentials') !== null;
  }

  getName(): string | undefined {
    const credString: string | null = sessionStorage.getItem('credentials');
    if (!credString) {
      return;
    }
    const creds: LoginPacket = JSON.parse(credString);
    return creds.username;
  }

  getId(): string | undefined {
    const credString: string | null = sessionStorage.getItem('credentials');
    if (!credString) {
      return;
    }
    const creds: LoginPacket = JSON.parse(credString);
    return creds.id; 
  }
}