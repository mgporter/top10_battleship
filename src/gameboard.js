import Cell from './cell';

export default function Gameboard(rows, columns) {
  const board = [];
  const receivedAttacksHistory = [];
  const ships = [];

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
    if (row >= rows || column >= columns || row < 0 || column < 0) {
      return false;
    } else {
      return true;
    }
  }

  function canPlace(shipSize, coordinates) {
    // Returns true if a ship is placeable at the given coordinates,
    // otherwise return false
    const coordinateCount = coordinates.length;
    if (shipSize > coordinateCount) return false;

    for (let i = 0; i < coordinateCount; i++) {
      const row = coordinates[i][0];
      const column = coordinates[i][1];
      if (!isInBounds([row, column])) return false;
      if (board[row][column].hasShip()) return false;
    }

    return true;
  }

  function placeShip(ship, coordinates, direction) {
    const coordinateCount = coordinates.length;

    if (ship.getLength() !== coordinateCount)
      throw new Error("Ship's length does not match coordinates passed");

    // If the ship is already on the board, we need to remove it first
    if (ship.isPlaced === true) {
      board.forEach((row) => {
        row.forEach((cell) => {
          if (cell.getShip() === ship) {
            cell.removeShip();
          }
        });
      });

      ships.splice([ships.indexOf(ship)], 1);
    }

    const cellsToAdd = [];

    for (let i = 0; i < coordinateCount; i++) {
      const row = coordinates[i][0];
      const column = coordinates[i][1];
      cellsToAdd.push(board[row][column]);
    }

    ships.push(ship);
    ship.isPlaced = true;
    ship.direction = direction;
    ship.startingCoordinates = [coordinates[0][0], coordinates[0][1]];
    cellsToAdd.forEach((cell, i) => cell.addShip(ship, i + 1));
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

  function getNumberOfShipsByName(shipName) {
    let counter = 0;
    board.forEach((row) => {
      row.forEach((cell) => {
        if (cell.getShip() && cell.getShip().getName() === shipName) {
          counter++;
        }
      });
    });
    return counter;
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
    getNumberOfShipsByName,
  };
}
