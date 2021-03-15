import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { WebSocketService } from './web-socket.service';
import { LoginPacket } from '../models/packets/login.packet';


@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(
        private router: Router,
        private auth: AuthService,
        private toast: ToastrService,
        private ws: WebSocketService,
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if (this.auth.isLoggedIn()) {
            this.ws.emit('PING', this.auth.getId())
            return true;
        }
        this.router.navigate(['/'], { queryParams: { returnUrl: state.url } });
        this.toast.error('Error', 'Unauthorized');
        return false;
    }
}