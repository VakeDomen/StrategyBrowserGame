import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { SocketHandlerService } from 'src/app/services/socket-handler.service';
import { GamePacket } from 'src/app/models/packets/game.packet';
import { Game } from 'src/app/models/game';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.sass']
})
export class GameComponent implements AfterViewInit {
  
  game: GamePacket | undefined;
  @ViewChild('canvas') canvas: ElementRef<HTMLCanvasElement> | undefined;
  @ViewChild('gui') gui: ElementRef<HTMLCanvasElement> | undefined;
  public canvasContext: CanvasRenderingContext2D | null = null;

  private runningGame: Game | undefined;

  constructor(
    private route: ActivatedRoute,
    private ws: SocketHandlerService,
  ) { }
  ngAfterViewInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.ws.setCotext('room', this);
      this.ws.getRoom(id);
      const game = sessionStorage.getItem(id);
      if (game) {
        this.game = JSON.parse(game);
        this.bootstrapGame();
      } 
    }
  }

  setRoom(game: GamePacket): void {
    this.game = game;
    sessionStorage.setItem(game.id, JSON.stringify(game));
    this.bootstrapGame();
  }

  bootstrapGame(): void {
    if (!!this.canvas && !!this.game && !!this.gui) {
      this.canvas.nativeElement.width = 1600;
      this.canvas.nativeElement.height = 900;
      this.gui.nativeElement.width = 1600;
      this.gui.nativeElement.height = 900;
      const game = new Game(this.game, this.ws, this.canvas, this.gui);
      game.start();
      this.runningGame = game;
    }
  }

  mouseUp(event: MouseEvent): void {
    if (this.runningGame) {
      this.runningGame.handleMouseUp(event);
    }
  }

  mouseDown(event: MouseEvent): void {
    if (this.runningGame) {
      this.runningGame.handleMouseDown(event)
    }
  }
}