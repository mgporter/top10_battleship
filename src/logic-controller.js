import Player from './player';
import { c } from './constants';
import { doRandomAttack, FollowUpAttack } from './attack';

export default function LogicController() {
  const rows = c.gameboardRows;
  const columns = c.gameboardColumns;
  const player1 = new Player(rows, columns);
  const player2 = new Player(rows, columns);

  const p1board = player1.board;
  const p2board = player2.board;

  function directionToCoordinates(ship, startCoordinates, direction) {
    // Returns an array of coordinates given the ship size, starting cell, and a direction

    const coordinateList = [];

    for (let i = 0, length = ship.getLength(); i < length; i++) {
      const newRow = startCoordinates[0] + i * c.paths[direction][0];
      const newColumn = startCoordinates[1] + i * c.paths[direction][1];
      coordinateList.push([newRow, newColumn]);
    }

    return coordinateList;
  }

  return {
    directionToCoordinates,
  };
}
