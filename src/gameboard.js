import Cell from './cell';

export default function Gameboard(rows, columns) {
  const board = [];
  const receivedAttacksHistory = [];
  const ships = [];
  let shipCounter = 1; // used as a unique id for each ship

  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j < columns; j++) {
      const cell = Cell();
      row.push(cell);
    }
    board.push(row);
  }

  function getRows() {
    return board.length;
  }

  function getColumns() {
    return board[0].length;
  }

  function getCells() {
    return board;
  }

  function getCell(coordinates) {
    return board[coordinates[0]][coordinates[1]];
  }

  function getCellByNumber(num) {
    const row = Math.floor(num / columns);
    const column = num % columns;
    return board[row][column];
  }

  function getCoordinatesByNumber(num) {
    const row = Math.floor(num / columns);
    const column = num % columns;
    return [row, column];
  }

  function isInBounds(coordinates) {
    const row = coordinates[0];
    const column = coordinates[1];
    if (row >= rows || column >= columns) {
      return false;
    } else {
      return true;
    }
  }

  function canPlace(ship, ...coordinates) {
    // Returns true if a ship is placeable at the given coordinates,
    // otherwise return false
    const coordinateCount = coordinates.length;

    if (ship.getLength() > coordinateCount) return false;

    for (let i = 0; i < coordinateCount; i++) {
      const row = coordinates[i][0];
      const column = coordinates[i][1];
      if (row > rows - 1 || column > columns - 1) return false;
      if (board[row][column].hasShip()) return false;
    }

    return true;
  }

  function placeShip(ship, ...coordinates) {
    const coordinateCount = coordinates.length;
    if (ship.getLength() !== coordinateCount)
      throw new Error("Ship's length does not match coordinates passed");

    // give the ship a unique id when placed on the gameboard
    ship.setId(shipCounter);
    shipCounter++;

    const cellsToAdd = [];

    for (let i = 0; i < coordinateCount; i++) {
      const row = coordinates[i][0];
      const column = coordinates[i][1];
      if (row > rows - 1 || column > columns - 1)
        throw new Error('Coordinates are out of bounds');
      if (board[row][column].hasShip())
        throw new Error('Cannot place a ship on top of another ship');

      // push the cells into an array until we can be sure that they all are empty
      cellsToAdd.push(board[row][column]);
    }

    ships.push(ship);
    cellsToAdd.forEach((cell) => cell.addShip(ship));
  }

  function getShipAtCell(coordinates) {
    return board[coordinates[0]][coordinates[1]].getShip();
  }

  function receiveAttack(coordinates) {
    const cell = board[coordinates[0]][coordinates[1]];
    let ship;

    // Catch errors, eg the space has already been attacked
    try {
      ship = cell.addHit();
    } catch (e) {
      throw e;
    }

    // Increase the hit counter on the ship, if there was one there
    if (ship) ship.hit();

    logShots(coordinates, ship);

    return ship;
  }

  function logShots(coordinates, ship) {
    receivedAttacksHistory.push({
      coordinates,
      ship,
      hit: ship ? true : false,
    });
  }

  function getLog(n = 0) {
    // returns the last n shots, or all shots if n is omitted
    return receivedAttacksHistory.slice(n * -1);
  }

  function getShipReport() {
    const shipsTotal = ships.length;
    const shipsSunk = ships.filter((ship) => ship.isSunk()).length;
    const shipsAlive = ships.filter((ship) => !ship.isSunk()).length;

    return {
      shipsTotal,
      shipsSunk,
      shipsAlive,
    };
  }

  return {
    getRows,
    getColumns,
    getCells,
    getCell,
    getCellByNumber,
    getCoordinatesByNumber,
    isInBounds,
    canPlace,
    placeShip,
    getShipAtCell,
    receiveAttack,
    getLog,
    getShipReport,
  };
}
