import Gameboard from './gameboard';
import Ship from './ship';
import ShipPlacement from './ship-placement';
import { C } from './constants';

export default function Player() {
  const board = Gameboard(C.gameboardRows, C.gameboardColumns);
  const ships = createShips();

  function getBoard() {
    return board;
  }

  function getShips() {
    return ships;
  }

  function getShipByName(shipName) {
    let targetShip;

    ships.forEach((ship) => {
      if (ship.getName() === shipName) {
        targetShip = ship;
      }
    });

    return targetShip;
  }

  function createShips() {
    // Create an array of ships and give each ship a unique ID
    // Currently, only one ship of each type is supported since many of the calls to
    // retrieve a ship object are done by name, and not a unique ID.
    const ships = [];
    let shipId = 1;
    for (const shipInfo of Object.values(C.ships)) {
      for (let i = 0; i < shipInfo.numberAllowed; i++) {
        const ship = Ship(shipInfo.name, shipInfo.size);
        ship.setId(shipId);
        shipId++;
        ships.push(ship);
      }
    }
    return ships;
  }

  function autoPlaceShips() {
    const shipPlacement = ShipPlacement(board);

    ships.forEach((ship) => {
      const shipSize = ship.getLength();
      const directions = Object.keys(C.paths);
      let canPlace = false;
      let randomDirectionIndex;
      let cells = [];

      // Keep trying to randomly place the ship until board.canPlace === true
      do {
        const totalCells = board.getRows() * board.getColumns();
        const randomNumber = Math.floor(Math.random() * totalCells);
        const randomCoordinates = board.getCoordinatesByNumber(randomNumber);

        randomDirectionIndex = Math.floor(Math.random() * 4);

        cells = shipPlacement.directionToCoordinates(
          randomCoordinates,
          shipSize,
          directions[randomDirectionIndex]
        );

        canPlace = board.canPlace(shipSize, cells);
      } while (!canPlace);
      console.log({ ship, cells });
      board.placeShip(ship, cells, directions[randomDirectionIndex]);
    });
  }

  return {
    getBoard,
    getShips,
    getShipByName,
    autoPlaceShips,
  };
}
