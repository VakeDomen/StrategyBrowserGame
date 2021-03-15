import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SocketHandlerService } from 'src/app/services/socket-handler.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.sass']
})
export class LoginComponent implements OnInit {

  public name: string | undefined;
  public password: string | undefined;

  constructor(
    private toastr: ToastrService,
    private sh: SocketHandlerService,
    private auth: AuthService,
  ) { }

  ngOnInit() {
    this.auth.logoutSilent();
  }
  

  login(): void {
    if (!this.name || !this.password) {
      this.toastr.error("Invalid crednetials!");
    } else {
      this.sh.login(this.name, this.password);
    }
  }

  register(): void {
    if (!this.name || !this.password) {
      this.toastr.error("Invalid crednetials!");
    } else {
      this.sh.register(this.name, this.password);
    }
  }

}