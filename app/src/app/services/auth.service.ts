import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private name: string | undefined;

  constructor(
    private toastr: ToastrService,
  ) { }

  login(name: string): void {
    this.name = name;
  }

  logout(): void {
    this.name = undefined;
    this.toastr.success('Logged out!');
  }
  logoutSilent(): void {
    this.name = undefined;
  }

  isLoggedIn(): boolean {
    return typeof this.name !== 'undefined';
  }

  getName(): string | undefined {
    return this.name;
  }
}