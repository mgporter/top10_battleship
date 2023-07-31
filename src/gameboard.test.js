const Gameboard = require('./gameboard');
const Ship = require('./ship');

test('reports coordinates', () => {
  const board = Gameboard(9, 12);
  expect(board.getRows()).toBe(9);
  expect(board.getColumns()).toBe(12);
});

test('places ship1 on board', () => {
  const board = Gameboard(9, 12);
  const ship1 = Ship('battleship', 4);
  board.placeShip(ship1, [2, 3], [2, 4], [2, 5], [2, 6]);

  expect(board.getShipAtCell(2, 3)).toBe(ship1);
  expect(board.getShipAtCell(2, 4)).toBe(ship1);
  expect(board.getShipAtCell(2, 5)).toBe(ship1);
  expect(board.getShipAtCell(2, 6)).toBe(ship1);
  expect(board.getShipAtCell(2, 7)).toBe(null);
  expect(board.getShipAtCell(2, 2)).toBe(null);
  expect(board.getShipAtCell(1, 4)).toBe(null);
  expect(board.getShipAtCell(3, 4)).toBe(null);
});

test('throws error if coordinates do not match ship length', () => {
  const board = Gameboard(9, 12);
  const ship1 = Ship('battleship', 4);

  expect(() => board.placeShip(ship1, [2, 3], [2, 4], [2, 5])).toThrow(Error);
  expect(() =>
    board.placeShip(ship1, [2, 3], [2, 4], [2, 5], [2, 6], [2, 7])
  ).toThrow(Error);
});

test('throws error if coordinates are outside board', () => {
  const board = Gameboard(9, 12);
  const ship1 = Ship('battleship', 4);

  // coordinates are 0-indexed
  expect(() =>
    board.placeShip(ship1, [6, 9], [6, 10], [6, 11], [6, 12])
  ).toThrow(Error);
});

test('throws error if two ships intersect', () => {
  const board = Gameboard(9, 12);
  const ship1 = Ship('battleship', 4);
  const ship2 = Ship('cruiser', 2);
  board.placeShip(ship1, [2, 3], [2, 4], [2, 5], [2, 6]);

  expect(() => board.placeShip(ship2, [3, 4], [2, 4])).toThrow(Error);
});

test('reports on all shots', () => {
  const board = Gameboard(9, 12);
  const ship1 = Ship('battleship', 4);
  board.placeShip(ship1, [2, 3], [2, 4], [2, 5], [2, 6]);
  board.receiveAttack(3, 5);
  board.receiveAttack(2, 5);
  board.receiveAttack(6, 4);
  expect(board.getLog()).toEqual([
    {
      row: 3,
      column: 5,
      ship: null,
      hit: false,
    },
    {
      row: 2,
      column: 5,
      ship: ship1,
      hit: true,
    },
    {
      row: 6,
      column: 4,
      ship: null,
      hit: false,
    },
  ]);
});

test('reports last shot', () => {
  const board = Gameboard(9, 12);
  const ship1 = Ship('battleship', 4);
  board.placeShip(ship1, [2, 3], [2, 4], [2, 5], [2, 6]);
  board.receiveAttack(3, 5);
  board.receiveAttack(2, 5);
  board.receiveAttack(6, 4);
  expect(board.getLog(1)).toEqual([
    {
      row: 6,
      column: 4,
      ship: null,
      hit: false,
    },
  ]);
});

test('reports error if same spot shot twice', () => {
  const board = Gameboard(9, 12);
  const ship1 = Ship('battleship', 4);
  board.placeShip(ship1, [2, 3], [2, 4], [2, 5], [2, 6]);
  board.receiveAttack(4, 8);
  expect(() => board.receiveAttack(4, 8)).toThrow(Error);
});

test('receive attack returns null on miss', () => {
  const board = Gameboard(9, 12);
  const ship1 = Ship('battleship', 4);
  board.placeShip(ship1, [2, 3], [2, 4], [2, 5], [2, 6]);
  expect(board.receiveAttack(1, 10)).toBe(null);
});

test("receive attack returns ship obj on hit and increments that obj's hit counter", () => {
  const board = Gameboard(9, 12);
  const ship1 = Ship('battleship', 4);
  const ship2 = Ship('cruiser', 2);
  board.placeShip(ship1, [2, 3], [2, 4], [2, 5], [2, 6]);
  board.placeShip(ship2, [7, 5], [8, 5]);
  expect(ship1.getHitCount()).toBe(0);
  expect(board.receiveAttack(2, 6)).toBe(ship1);
  expect(ship1.getHitCount()).toBe(1);
  expect(ship2.getHitCount()).toBe(0);
});

test('reports when all ships are sunk', () => {
  const board = Gameboard(9, 12);
  const ship1 = Ship('battleship', 4);
  const ship2 = Ship('cruiser', 2);
  board.placeShip(ship1, [2, 3], [2, 4], [2, 5], [2, 6]);
  board.placeShip(ship2, [7, 5], [8, 5]);
  expect(board.getShipReport()).toEqual({
    shipsTotal: 2,
    shipsSunk: 0,
    shipsAlive: 2,
  });
  board.receiveAttack(2, 3);
  board.receiveAttack(2, 4);
  board.receiveAttack(2, 5);
  board.receiveAttack(2, 6);
  board.receiveAttack(7, 5);
  board.receiveAttack(8, 5);
  expect(board.getShipReport()).toEqual({
    shipsTotal: 2,
    shipsSunk: 2,
    shipsAlive: 0,
  });
});
