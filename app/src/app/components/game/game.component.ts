import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { SocketHandlerService } from 'src/app/services/socket-handler.service';
import { Game } from 'src/app/models/game';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.sass']
})
export class GameComponent implements OnInit {
  
  game: Game | undefined;
  @ViewChild('canvas') canvas: ElementRef | undefined;
  public canvasContext: CanvasRenderingContext2D | null = null;;


  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    private ws: SocketHandlerService,
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.ws.setCotext('room', this);
      this.ws.getRoom(id);
    }
  }

  setRoom(room: Game): void {
    this.game = room;
    this.bootstrapGame();
  }

  bootstrapGame(): void {
    if (this.canvas && this.game) {
      this.canvasContext = (<HTMLCanvasElement>this.canvas.nativeElement).getContext('2d');
      switch (this.game.mode) {
        case 'VERSUS':
          console.log('NEW GAME!!! VERSUS');
          break;
      
        default:
          console.log('NEW GAME!!! VERSUS');
          break;
      }
    }
  }
}