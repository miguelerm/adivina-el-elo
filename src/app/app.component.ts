import { Component } from '@angular/core';
import { ChessDotComService, GamePlayer, PieceColor } from './chess-dot-com.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  public color: PieceColor = 'white';
  public time: number = 0;
  public increment?: number;
  public png: string = '';
  public link: string = '';
  public players: GamePlayer[] = [];
  public loading: boolean = false;
  public loaded: boolean = false;
  public error: string = '';

  public get message(): string {
    return `Maestro Gascon, te comparto mi partida a "${this.time} minutos${this.increment ? ` más ${this.increment} segundos` : ''}", yo juegaba con piezas "${this.color === 'white' ? 'blancas' : 'negras'}."

${this.png}`;
  }

  constructor(private readonly chessDotCom: ChessDotComService) {

  }

  public GetMessage(): void {
    this.loading = true;
    this.chessDotCom.getGameByUrl(this.link).subscribe({
      next: (game) => {
        this.png = game.png
        this.players = game.players
        this.color = game.players[0].color;
        this.time = game.time;
        this.increment = game.increment
        this.loading = false;
        this.loaded = true;
      },
      error: (error) => {
        const link = this.link;
        this.clean();
        this.error = error;
        this.link = link;
      }
    });
  }

  public clean(): void {
    this.color = 'white';
    this.time = 0;
    this.increment = undefined;
    this.png = '';
    this.link = '';
    this.players = [];
    this.loaded = false;
    this.loading = false;
    this.error = '';
  }
}
