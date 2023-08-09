import { C } from './constants';
import Model from './models';
import MessageBox from './messagebox';

export default function ShipPlacement(board = null, addModelToScene = null) {
  let shipName = '';
  let shipDisplayName = '';
  let shipSize = 0;
  const directions = Object.keys(C.paths);
  let shipDirectionIndex = 0;
  let mouseoverCellRow, mouseoverCellColumn;
  let mouseOverBoard = false;
  let readyToPlace = false;
  let firstPlacement = true;
  const playerBoard = document.getElementById('playerboard');
  const addShipFieldset = document.getElementById('addShipSelection');
  const healthPanel = document.querySelector('aside#health-container');
  const placedShips = [];
  const messageBox = MessageBox();
  console.log('ShipPlacementcalled');

  function showPlayerBoardHoverPlacements(newName) {
    shipName = newName;
    shipSize = C.ships[shipName].size;
    shipDisplayName = C.ships[shipName].displayName;
    shipDirectionIndex = 0;
    mouseOverBoard = false;
    readyToPlace = false;

    if (firstPlacement) {
      healthPanel.classList.remove('boardflash');
      playerBoard.classList.remove('disable-hover');
      playerBoard.classList.add('boardflash');
      addPlacementEventListeners();
    }

    messageBox.write(`Place your ${shipDisplayName}`);

    firstPlacement = false;
  }

  function directionToCoordinates(startCoordinates, size, direction = 'left') {
    // Returns an array of coordinates given the ship size, starting cell, and a direction
    const cellCoordinates = [];

    for (let i = 0; i < size; i++) {
      const newRow = startCoordinates[0] + i * C.paths[direction][0];
      const newColumn = startCoordinates[1] + i * C.paths[direction][1];
      if (!board.isInBounds([newRow, newColumn])) continue;
      const cell = [newRow, newColumn];
      cellCoordinates.push(cell);
    }

    return cellCoordinates;
  }

  function coordinatesToCells(cellCoordinates) {
    return cellCoordinates.map((coordinates) => {
      return playerBoard.querySelector(
        `.cell[data-row="${coordinates[0]}"][data-column="${coordinates[1]}"]`
      );
    });
  }

  function addPlacementEventListeners() {
    playerBoard.addEventListener('mouseover', highlightCells);
    playerBoard.addEventListener('mouseleave', mouseLeaveBoard);
    window.addEventListener('wheel', changeShipDirection);
    playerBoard.addEventListener('click', placeShip);
  }

  function clearPlacementEventListeners() {
    playerBoard.removeEventListener('mouseover', highlightCells);
    playerBoard.removeEventListener('mouseleave', mouseLeaveBoard);
    window.removeEventListener('wheel', changeShipDirection);
    playerBoard.removeEventListener('click', placeShip);
  }

  function removeHighlightedCells() {
    const oldCells = playerBoard.querySelectorAll(
      '.cell.canplace, .cell.cannotplace'
    );
    oldCells.forEach((cell) =>
      cell.classList.remove('canplace', 'cannotplace')
    );
  }

  function mouseLeaveBoard() {
    mouseOverBoard = false;
    removeHighlightedCells();
  }

  function highlightCells(e, changeDirection = false) {
    // the 'changeDirection' flag is true when the ship direction is changed and the
    // highlighted cells just need updating. It is false when this function is
    // triggered from the mouseover event listener
    if (!changeDirection) {
      if (!e.target.className.includes('cell')) return;
      mouseOverBoard = true;
      mouseoverCellRow = Number(e.target.dataset.row);
      mouseoverCellColumn = Number(e.target.dataset.column);
    }

    if (!mouseOverBoard) return;

    // Remove highlighting from old cells
    removeHighlightedCells();

    const cells = directionToCoordinates(
      [mouseoverCellRow, mouseoverCellColumn],
      shipSize,
      directions[shipDirectionIndex] // The directions Object is an array of directions
    );

    if (board.canPlace(shipSize, cells)) {
      coordinatesToCells(cells).forEach((cell) =>
        cell.classList.add('canplace')
      );
      readyToPlace = true;
    } else {
      coordinatesToCells(cells).forEach((cell) =>
        cell.classList.add('cannotplace')
      );
      readyToPlace = false;
    }
  }

  function changeShipDirection(e) {
    if (e.deltaY < 0) {
      shipDirectionIndex += 1;
      if (shipDirectionIndex >= 4) shipDirectionIndex = 0;
      highlightCells(null, true);
    } else {
      shipDirectionIndex -= 1;
      if (shipDirectionIndex < 0) shipDirectionIndex = 3;
      highlightCells(null, true);
    }
  }

  function placeShip() {
    if (!readyToPlace || !mouseOverBoard) return;
    // This function is from the models module
    addModelToScene(
      shipName,
      directions[shipDirectionIndex],
      mouseoverCellRow,
      mouseoverCellColumn
    );

    window.dispatchEvent(
      new CustomEvent('ship_placed', {
        detail: {
          shipName,
          direction: directions[shipDirectionIndex],
          coordinates: directionToCoordinates(
            [mouseoverCellRow, mouseoverCellColumn],
            shipSize,
            directions[shipDirectionIndex]
          ),
        },
      })
    );

    const label = addShipFieldset.querySelector(
      `label[data-ship="${shipName}"]`
    );
    label.classList.add('ship-placed');
    const addedCompleteMark = document.createElement('div');
    addedCompleteMark.classList.add('ship-placed');
    addedCompleteMark.textContent = '✓';

    label.appendChild(addedCompleteMark);

    // Remove boardflash in case it is still on
    playerBoard.classList.remove('boardflash');

    // Make a list of placed ships and send a signal when all have been added
    if (!placedShips.includes(shipName)) placedShips.push(shipName);
    if (placedShips.length === 5) {
      messageBox.write(`All ships placed. You may begin the game.`);
      window.dispatchEvent(new Event('all_ships_added'));
    } else {
      messageBox.write(`${shipDisplayName} placed successfully!`);
    }
  }

  return {
    showPlayerBoardHoverPlacements,
    clearPlacementEventListeners,
    directionToCoordinates,
  };
}
