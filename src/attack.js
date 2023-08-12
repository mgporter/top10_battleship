import { C } from './constants';

export function doRandomAttack(board) {
  // Attack a random, non-attacked cell
  let totalCells = board.getRows() * board.getColumns();
  let originalNum = Math.floor(Math.random() * totalCells);
  let cellNum = originalNum;

  let goForward = true;

  while (board.getCellByNumber(cellNum).beenAttacked()) {
    // go forward until a non-attacked cell is found.
    if (goForward) {
      cellNum += 1;
    }

    // if we reach the end, then go back to the original starting cell and...
    if (cellNum >= totalCells) {
      goForward = false;
      cellNum = originalNum;
    }

    // ...continue the search going backwards until the beginning
    if (!goForward) {
      cellNum -= 1;
      if (cellNum < 0) break;
    }
  }

  return board.getCoordinatesByNumber(cellNum);
}

export function FollowUpAttack(board, startingCoordinates) {
  // After a hit using the random attack algorithm, the computer can follow it up with
  // this attack algorithm. This algorithm needs to be passed the coordinates of the
  // previous hit. After that, it will target the spaces around the hit in order to find the
  // rest of the ship.
  const directions = ['up', 'down', 'left', 'right'];
  const ship = board.getCell(startingCoordinates).getShip();
  if (!ship)
    throw new Error(
      'Follow-up attack algorithm must start from hit coordinates'
    );

  const startingRow = startingCoordinates[0];
  const startingColumn = startingCoordinates[1];

  let lastDirectionPath = null;
  let followUpIteration = 2;
  let lastAttack = null;
  let foundDirection = false;
  let reverseAttackFlag = false;

  function attack(lastResult) {
    // the result is the return of receiveAttack, which is a ship (if there
    // was a hit, or null if not

    if (!lastResult && !foundDirection) {
      return startAttack();
    } else if (lastResult && followUpIteration > 0) {
      return continueAttack(lastDirectionPath);
    } else if ((!lastResult && foundDirection) || reverseAttackFlag) {
      reverseAttackFlag = true;
      return reverseAttack(lastDirectionPath);
    } else {
      // If nothing else, give up.
      return null;
    }
  }

  function startAttack() {
    // If the ship is already sunk, then return null
    if (ship.isSunk()) return null;

    // Get coordinates of a random, adjacent space
    let randomNumber = Math.floor(Math.random() * directions.length);
    let randomDirection = directions[randomNumber];
    let randomPath = C.paths[randomDirection];
    let newCoordinates = [
      startingRow + randomPath[0],
      startingColumn + randomPath[1],
    ];

    // Keep looping until we find a space that is in bounds and has not been attacked before
    while (
      !board.isInBounds(newCoordinates) ||
      board.getCell(newCoordinates).beenAttacked()
    ) {
      removeFromArray(directions, randomDirection);
      randomNumber = Math.floor(Math.random() * directions.length);
      randomDirection = directions[randomNumber];
      randomPath = C.paths[randomDirection];
      newCoordinates = [
        startingRow + randomPath[0],
        startingColumn + randomPath[1],
      ];
    }

    // Remove the direction we are going to attack in from the array, so next time it isn't selected
    removeFromArray(directions, randomDirection);

    // Remember this direction, in case we get a hit this time
    lastDirectionPath = randomPath;

    lastAttack = newCoordinates;
    return newCoordinates;
  }

  function continueAttack(directionPath) {
    foundDirection = true;

    // If the ship is already sunk, then return null
    if (ship.isSunk()) return null;

    // Get new coordinates that continue in the same direction.
    let newCoordinates = [
      startingRow + followUpIteration * directionPath[0],
      startingColumn + followUpIteration * directionPath[1],
    ];

    // If the space is out of bounds or has already been attacked, we need to go in the opposite direction
    if (
      !board.isInBounds(newCoordinates) ||
      board.getCell(newCoordinates).beenAttacked()
    ) {
      reverseAttackFlag = true;
      return reverseAttack(directionPath);
    } else {
      // Otherwise, we can just increment the iterator to keep going in this direction
      followUpIteration++;
      lastAttack = newCoordinates;
      return newCoordinates;
    }
  }

  function reverseAttack(directionPath) {
    // If the ship is already sunk, then return null
    if (ship.isSunk()) return null;

    if (followUpIteration > 0) followUpIteration = -1;

    // Get new coordinates that continue in the reverse direction, because
    // followUpIteration is now negative
    let newCoordinates = [
      startingRow + followUpIteration * directionPath[0],
      startingColumn + followUpIteration * directionPath[1],
    ];

    if (
      !board.isInBounds(newCoordinates) ||
      board.getCell(newCoordinates).beenAttacked()
    ) {
      // If this cell is not in bounds or has been attacked, we give up
      return null;
    } else {
      // Otherwise, we can just increment the iterator to keep going in this direction
      followUpIteration--;
      lastAttack = newCoordinates;
      return newCoordinates;
    }
  }

  function removeFromArray(arr, value) {
    const index = arr.indexOf(value);
    arr.splice(index, 1);
  }

  return {
    attack,
  };
}
