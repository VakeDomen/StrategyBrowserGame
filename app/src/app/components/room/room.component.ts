import { Component, OnInit } from '@angular/core';
import { GamePacket } from 'src/app/models/packets/game.packet';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { SocketHandlerService } from 'src/app/services/socket-handler.service';
import { ToastrService } from 'ngx-toastr';
import { CacheService } from 'src/app/services/cache.service';
import { StartGamePacket } from 'src/app/models/packets/start-game.packet';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.sass']
})
export class RoomComponent implements OnInit {

  game: GamePacket | undefined;
  name: string = '';
  radius: number = 20;

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    private ws: SocketHandlerService,
    private router: Router,
    private toastr: ToastrService,
    private cache: CacheService,
  ) { }

  ngOnInit(): void {
    const context = this;
    this.ws.setCotext('room', context)
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.ws.getRoom(id);
    }
  }

  setRoom(room: GamePacket): void {
    this.game = room;
  }

  isHost(): boolean {
    if (this.game) {
      return (this.game && this.game.host === this.auth.getId());
    } else {
      return false;
    }
  }

  isMember(): boolean {
    const id = this.auth.getId();
    if (id && this.game) {
      return (this.game && this.game.players.includes(id));
    } else {
      return false;
    }
  }

  leaveRoom(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.ws.leaveRoom(id);
    }
  }

  joinRoom(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.ws.joinRoom(id);
    }
  }


  userById(id: string): string {
    const user = this.cache.getUserById(id);
    if (user) {
      return user.username;
    }
    return id;
  }


  startGame(): void {
    if (this.game) {
      this.ws.startGame({
        id: this.game.id,
        name: this.name,
        radius: this.radius
      } as StartGamePacket);
    }
  }

  handleStartGame(game: GamePacket): void {
    if (game.players.includes(this.auth.getId() as string)) {
      this.router.navigate(['/game', game.id]);    
    } else {
      this.toastr.info('New game started!');
    }
  }
}