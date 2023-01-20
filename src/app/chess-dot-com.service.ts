import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import decodePgn from './chess-dot-come-pgn-decoder';

const HTTP_BASE_URL = 'https://api.codetabs.com/v1/proxy/?quest=https://www.chess.com'

@Injectable({
  providedIn: 'root'
})
export class ChessDotComService {

  constructor(private readonly http: HttpClient) { }

  public getGameByUrl(url: string): Observable<Game> {
    const id = url.split('/').pop();
    return this.http.get<CallbackGame>(HTTP_BASE_URL + `/callback/live/game/${id}`)
      .pipe(map(x => buildGame(url, x)));
  }
}

function buildGame(url: string, response: CallbackGame): Game
{
  const { game, players } = response;
  const { moveList, pgnHeaders } = game;
  const { Date, Result, FEN, White, Black, TimeControl } = pgnHeaders;

  const headers = {
    Date, Result, White, Black, TimeControl, Link: url
  };

  const gamePlayers: GamePlayer[] = [players.top, players.bottom].map(x => ({
    name: x.username,
    avatar: x.avatarUrl,
    color: x.color
  }));

  const [time, increment] = getTime(TimeControl);

  return {
    time,
    increment,
    players: gamePlayers,
    png: decodePgn(moveList, headers, FEN)
  };
}

function getTime(timeControl: string): number[]
{
  return timeControl.split(/[^0-9]/).map((x, i) => parseInt(x) / (i === 0 ? 60 : 1));
}

interface CallbackGame {
  game: {
    moveList: string,
    pgnHeaders: {
      Date: string,
      Result: string,
      FEN: string,
      White: string,
      Black: string,
      TimeControl: string
    }
  },
  players: CallbackPlayers
}

interface CallbackPlayers {
  top: CallbackPlayer
  bottom: CallbackPlayer
}

interface CallbackPlayer {
  avatarUrl: string,
  username: string,
  color: PieceColor,
}

export type PieceColor = 'white'|'black';

export interface Game {
  time: number,
  increment?: number,
  players: GamePlayer[],
  png: string,
}

export interface GamePlayer {
  avatar: string,
  name: string,
  color: PieceColor
}
