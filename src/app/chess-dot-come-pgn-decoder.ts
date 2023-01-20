// stolen from: https://github.com/andyruwruw/chess-web-api/blob/master/src/endpoints/games.js

import { Chess } from "chess.js";

// see: https://github.com/andyruwruw/chess-web-api/issues/10#issuecomment-779735204
const BOARD_POSITIONS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?';
const BOARD_FILES = 'abcdefgh';
const BOARD_LENGTH = 8;

// see: https://github.com/andyruwruw/chess-web-api/issues/11#issuecomment-783687021
const PROMOTION_TABLE = '#@$_[]^()~{}';
const PROMOTION_TABLE_ROWS = 'brnq';
const PROMOTION_TABLE_ROWS_LENGTH = 4;
const PROMOTION_TABLE_COLUMNS_LENGTH = 3;
const PROMOTION_CAPTURE_LEFT = 1;
const PROMOTION_CAPTURE_RIGHT = 2;

export default function decodePgn(encodedMovements: string, headers: {[key: string]: string}, fen?: string): string
{
  const chess = new Chess(fen);

  for (const key in headers) {
    if (Object.prototype.hasOwnProperty.call(headers, key)) {
      const value = headers[key];
      chess.header(key, value);
    }
  }

  for (let index = 0; index < encodedMovements.length; index += 2) {
    const fromEncoded = encodedMovements[index];
    const toEncoded = encodedMovements[index + 1];

    const from = decodeMove(fromEncoded) || '';
    const [to, promotion] = decodeToMove(toEncoded, from);

    chess.move({
      from,
      to,
      promotion
    });
  }

  return chess.pgn();
}

function decodeMove(encodedMove: string): string|null {
  const index = BOARD_POSITIONS.indexOf(encodedMove);
  if (index < 0) {
    return null
  }
  const file = BOARD_FILES[index % BOARD_LENGTH];
  const rank = Math.floor(index / BOARD_LENGTH) + 1;
  return `${file}${rank}`;
}

function decodeToMove(encodedMove: string, from: string): [string, string|undefined]
{
  const to = decodeMove(encodedMove);

  if (to){
    return [to, undefined]
  }

  const promotionIndex = PROMOTION_TABLE.indexOf(encodedMove);
  const pieceIndex = Math.floor(promotionIndex / PROMOTION_TABLE_COLUMNS_LENGTH);
  const piece = PROMOTION_TABLE_ROWS[pieceIndex];

  const isCaptureLeft = promotionIndex % PROMOTION_TABLE_COLUMNS_LENGTH
      === PROMOTION_CAPTURE_LEFT;
  const isCaptureRight = promotionIndex % PROMOTION_TABLE_COLUMNS_LENGTH
      === PROMOTION_CAPTURE_RIGHT;

  const fromFile = from[0];
  const fromRank = from[1];
  const fromFileIndex = BOARD_FILES.indexOf(fromFile);

  let toFileIndex;
  if (isCaptureLeft) {
    toFileIndex = fromFileIndex - 1;
  } else {
    toFileIndex = isCaptureRight
      ? fromFileIndex + 1
      : fromFileIndex;
  }

  const toFile = BOARD_FILES[toFileIndex];

  let toRank;
  if (fromRank === '2') {
    toRank = '1';
  } else if (fromRank === '7') {
    toRank = '8';
  }

  const toPromoted = `${toFile}${toRank}`;

  return [toPromoted, piece];
}
