import Gameboard from './gameboard';

export default function Player(rows, columns) {
  const board = Gameboard(rows, columns);
  const boardArr = board.board;

  return {
    board,
    boardArr,
  };
}
