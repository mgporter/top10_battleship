import LogicController from './logic-controller';
import Ship from './ship';
import { c } from './constants';

// const carrier = Ship(c.ships[0].name, c.ships[0].length);
// const battleship = Ship(c.ships[1].name, c.ships[1].length);
// const cruiser = Ship(c.ships[2].name, c.ships[2].length);
// const submarine = Ship(c.ships[3].name, c.ships[3].length);
// const destroyer = Ship(c.ships[4].name, c.ships[4].length);

// const player1 = new Player(9, 12);
// const player2 = new Player(9, 12);
// const p1board = player1.board;
// const p2board = player2.board;

// const player1 = new Player(9, 12);
// const p1board = player1.board;
// const battleship = Ship(c.ships[1].name, c.ships[1].length);
// const cruiser = Ship(c.ships[2].name, c.ships[2].length);
// p1board.placeShip(battleship, [2,2], [2,3], [2,4], [2,5]);
// expect(lc.placeShip(cruiser, [1, 3], [1, 4], [1, 5]))

test('returns true where a ship is placable', () => {
  const lc = LogicController();
  const cruiser = Ship(c.ships[2].name, c.ships[2].length);

  expect(lc.directionToCoordinates(cruiser, [4, 4], 'up')).toEqual([
    [4, 4],
    [3, 4],
    [2, 4],
  ]);
  expect(lc.directionToCoordinates(cruiser, [4, 4], 'down')).toEqual([
    [4, 4],
    [5, 4],
    [6, 4],
  ]);
  expect(lc.directionToCoordinates(cruiser, [4, 4], 'left')).toEqual([
    [4, 4],
    [4, 3],
    [4, 2],
  ]);
  expect(lc.directionToCoordinates(cruiser, [4, 4], 'right')).toEqual([
    [4, 4],
    [4, 5],
    [4, 6],
  ]);
});
