import { C } from './constants';
import Model from './models';
import ShipPlacement from './ship-placement';
import MessageBox from './messagebox';

export default function DomManager(player1, player2) {
  let shipPlacement;

  const p1board = player1.getBoard();
  const p2board = player2.getBoard();

  buildPageStructure();

  const model = Model();
  model.resizeCanvasToDisplaySize();

  const messageBox = MessageBox();

  // Start the game with the mainElement in the middle
  movePlayerboardToCenter(true);

  // disableZoom();

  function movePlayerboardToCenter(move) {
    const mainElement = document.querySelector('main');
    const mb = messageBox.getElement();

    // const playerCanvas = document.getElementById('playercanvas');
    // const oldWidth = window.innerWidth;
    const offsetX = window.innerWidth * 0.14;
    let transitionDone = false;

    if (move) {
      mainElement.style.transition = 'none';
      mb.style.transition = 'opacity 200ms';
      mainElement.style.transform = `translate(${offsetX}px, 0)`;
      mb.style.transform = `translate(${offsetX}px, 0)`;
      // window.addEventListener('resize', changeMainelementOffset);
    } else {
      // window.removeEventListener('resize', changeMainelementOffset);
      mainElement.style.transition = 'transform 400ms';
      mb.style.transition = 'opacity 200ms, transform 400ms';
      mainElement.style.transform = `translate(0px, 0)`;
      mb.style.transform = `translate(0px, 0)`;
      animateCanvasTranslation();
      mainElement.addEventListener('transitionend', () => {
        mainElement.style.transition = 'none';
        mb.style.transition = 'opacity 200ms';
        transitionDone = true;
      });
    }

    function animateCanvasTranslation() {
      const animation = requestAnimationFrame(animateCanvasTranslation);
      model.resizeCanvasToDisplaySize();
      if (transitionDone) {
        cancelAnimationFrame(animation);
      }
    }
  }

  function changeMainelementOffset() {
    const newWidth = window.innerWidth;
    let deltaX = (oldWidth - newWidth) * 0.2;
    if (deltaX > offsetX) deltaX = offsetX;
    mainElement.style.transform = `translate(${offsetX - deltaX}px, 0)`;
    console.log('resize from dom');
    model.resizeCanvasToDisplaySize();
  }

  function disableZoom() {
    // Disable scroll and resize
    document.addEventListener('keydown', function (e) {
      if (e.ctrlKey && (e.key === '+' || e.key == '-' || e.key == '=')) {
        e.preventDefault();
      }
    });
    document.addEventListener(
      'wheel',
      function (e) {
        if (e.ctrlKey) {
          e.preventDefault();
        }
      },
      {
        passive: false,
      }
    );
  }

  function buildPageStructure() {
    const gameContainer = document.createElement('div');
    gameContainer.id = 'game-container';

    const playerHeader = document.createElement('header');
    playerHeader.id = 'player';

    const opponentHeader = document.createElement('header');
    opponentHeader.id = 'opponent';

    const healthContainer = document.createElement('aside');
    healthContainer.id = 'health-container';

    const main = document.createElement('main');

    const playerBoard = createPlayerboard();
    main.appendChild(playerBoard);

    const section = document.createElement('section');

    const statsContainer = document.createElement('aside');
    statsContainer.id = 'stats-container';

    gameContainer.append(
      playerHeader,
      opponentHeader,
      healthContainer,
      main,
      section,
      statsContainer
    );

    document.body.appendChild(gameContainer);
  }

  function createPlayerboard() {
    const playerBoard = document.createElement('div');
    playerBoard.id = 'playerboard';

    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        const cell = document.createElement('div');
        cell.className = 'cell playerboard';
        cell.setAttribute('data-row', i);
        cell.setAttribute('data-column', j);
        playerBoard.appendChild(cell);
      }
    }

    const ping = createPingRing();
    playerBoard.appendChild(ping);

    return playerBoard;
  }

  function createOpponentboard() {
    const opponentBoard = document.createElement('div');
    opponentBoard.id = 'opponentboard';

    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        const cell = document.createElement('div');
        cell.className = 'cell opponentboard';
        cell.setAttribute('data-row', i);
        cell.setAttribute('data-column', j);
        opponentBoard.appendChild(cell);
      }
    }

    const ping = createPingRing();
    opponentBoard.appendChild(ping);

    return opponentBoard;
  }

  function createPingRing() {
    const pingContainer = document.createElement('div');
    pingContainer.classList.add('ping-container');
    const pingRing = document.createElement('div');
    pingRing.classList.add('ping-ring');
    pingContainer.appendChild(pingRing);
    return pingContainer;
  }

  function createStatsAside() {
    const statsAside = document.createElement('aside');
    statsAside.id = 'stats';
    return statsAside;
  }

  function startAddShipPhase() {
    // Create the add ship menu
    const healthPanel = document.createElement('aside');
    healthPanel.id = 'health';

    const addShipHeader = document.createElement('h3');
    addShipHeader.textContent = 'Add your ships';

    const addShipDescription = document.createElement('p');
    addShipDescription.textContent =
      'Select a ship, then click on a cell to add it to your board. Use the mousewheel to rotate.';

    healthPanel.append(addShipHeader, addShipDescription);

    const addShipSelection = document.createElement('fieldset');
    addShipSelection.id = 'addShipSelection';

    Object.values(C.ships).forEach((ship) => {
      const containerLabel = document.createElement('label');
      containerLabel.setAttribute('for', ship.name);
      containerLabel.setAttribute('data-ship', ship.name);

      const container = document.createElement('input');
      container.setAttribute('type', 'radio');
      container.setAttribute('id', ship.name);
      container.setAttribute('name', 'addship');
      container.setAttribute('value', ship.name);

      const img = document.createElement('img');
      img.src = ship.sideimg;
      img.alt = ship.displayName;
      img.setAttribute('data-ship', ship.name);
      img.style.transform = 'scaleX(-1)';
      img.style.width = `${20 * ship.size}%`;

      containerLabel.append(container, img);
      addShipSelection.appendChild(containerLabel);
    });

    healthPanel.appendChild(addShipSelection);
    document.getElementById('health-container').appendChild(healthPanel);

    const startButton = document.createElement('button');
    startButton.classList.add('start-game-button');
    startButton.textContent = 'Start!';
    startButton.style.visibility = 'hidden';
    healthPanel.appendChild(startButton);

    // Retrieve the ship placement module
    shipPlacement = ShipPlacement(p1board, model.addModelToScene);

    addShipSelection.addEventListener(
      'click',
      function handleShipSelection(event) {
        // Check to make sure selection is valid
        if (event.target.tagName !== 'INPUT') return;
        const target = addShipSelection.querySelector(
          'input[type="radio"]:checked'
        );
        if (!target) return;

        // Handle the click
        shipPlacement.showPlayerBoardHoverPlacements(target.value);
      }
    );

    window.addEventListener('all_ships_added', showStartGameButton, {
      once: true,
    });
  }

  function showStartGameButton() {
    const startButton = document.querySelector('.start-game-button');
    startButton.style.visibility = 'visible';
    startButton.addEventListener(
      'click',
      () => {
        window.dispatchEvent(new Event('start_game'));
        messageBox.clear();
      },
      { once: true }
    );
  }

  function initiateDomForGameLoop() {
    shipPlacement.clearPlacementEventListeners();

    const healthPanel = document.getElementById('health');
    healthPanel.style.transition = 'opacity 600ms linear';
    healthPanel.style.opacity = 0;
    healthPanel.addEventListener(
      'transitionend',
      () => {
        displayShipHealthPanel();
      },
      { once: true }
    );

    const opponentSection = document.querySelector('section');
    const opponentBoard = createOpponentboard();

    const statsContainer = document.getElementById('stats-container');
    const statsAside = createStatsAside();

    opponentBoard.style.transform = `translate(${
      window.innerWidth * 0.4
    }px, 0)`;
    statsAside.style.transform = `translate(${window.innerWidth * 0.4}px, 0)`;

    opponentSection.appendChild(opponentBoard);
    statsContainer.appendChild(statsAside);

    const opponentHeading = document.createElement('div');
    opponentHeading.style.opacity = 0;
    opponentHeading.textContent = 'Opponent status';
    document.querySelector('header#opponent').appendChild(opponentHeading);

    opponentBoard.style.transition = `transform 800ms cubic-bezier(0,.33,.31,1) 400ms`;
    statsAside.style.transition = `transform 800ms cubic-bezier(0,.63,.31,1) 600ms`;

    movePlayerboardToCenter(false);

    setTimeout(() => {
      opponentBoard.style.transform = `translate(0px, 0)`;
      statsAside.style.transform = `translate(0px, 0)`;
      opponentBoard.addEventListener(
        'transitionend',
        () => {
          opponentHeading.style.opacity = 1;
          window.dispatchEvent(new Event('dom_ready_for_game_loop'));
        },
        { once: true }
      );
    }, 5);
  }

  function displayShipHealthPanel() {
    const healthPanel = document.getElementById('health');
    healthPanel.textContent = '';

    const header = document.createElement('h3');
    header.textContent = 'Damage Report';

    const shipsAlive = document.createElement('p');
    shipsAlive.innerHTML = `<span class="ships-sunk">0</span> of <span class="ships-total">0</span> ships sunk.`;
    healthPanel.append(header, shipsAlive);

    const healthBoxContainer = document.createElement('div');
    healthBoxContainer.id = 'health-box-container';

    player1.getShips().forEach((ship) => {
      const shipName = ship.getName();

      const container = document.createElement('div');
      container.classList.add('ship-health-container');
      container.setAttribute('data-ship', shipName);
      container.style.width = `${20 * ship.getLength()}%`;

      const shipLength = ship.getLength();
      container.style.gridTemplateColumns = `repeat(${shipLength}, 1fr)`;

      for (let i = shipLength; i > 0; i--) {
        const healthBox = document.createElement('div');
        healthBox.classList.add('health-box');
        healthBox.setAttribute('data-shipsection', i);
        container.appendChild(healthBox);
      }

      const img = document.createElement('img');
      img.src = C.ships[shipName].sideimg;
      img.alt = C.ships[shipName].displayName;
      img.style.transform = 'scaleX(-1)';
      img.style.width = 'calc(100% - 12px)';

      container.appendChild(img);

      healthBoxContainer.appendChild(container);
    });

    healthPanel.appendChild(healthBoxContainer);

    healthPanel.style.opacity = 1;
  }

  function playerSelectAttack() {
    const playerBoard = document.getElementById('playerboard');
    const opponentBoard = document.getElementById('opponentboard');
    console.log('playerselectattack');
    messageBox.write('Sir, where should we target?');

    playerBoard.classList.add('disable-hover');
    opponentBoard.style.boxShadow = '0 0 4px blue';
    opponentBoard.classList.add('boardflash');

    const controller = new AbortController();

    opponentBoard.addEventListener(
      'click',
      (e) => {
        console.log(e);
        console.log('clicked for attack to opponent');

        const row = e.target.dataset.row;
        const column = e.target.dataset.column;
        const cell = getCellFromCoordinates('opponent', row, column);

        if (cell.className.includes('miss') || cell.className.includes('hit')) {
          messageBox.write(
            "We can't target a space that has already received fire, sir."
          );
          return;
        }

        opponentBoard.classList.remove('boardflash');
        playerBoard.classList.remove('disable-hover');

        pingBoard('opponent', row, column, () => {
          window.dispatchEvent(
            new CustomEvent('player_target_selected', {
              detail: { row, column },
            })
          );
        });
        controller.abort(); // If the user selects a valid cell, signal that this event listener is done and can be removed
      },
      { signal: controller.signal }
    );
  }

  function getCellFromCoordinates(who, row, column) {
    let board;
    if (who === 'player') {
      board = document.getElementById('playerboard');
    } else if (who === 'opponent') {
      board = document.getElementById('opponentboard');
    }

    return board.querySelector(
      `.cell[data-row="${row}"][data-column="${column}"]`
    );
  }

  function pingBoard(who, row, column, executeAfterPing = null) {
    let board;
    if (who === 'player') {
      board = document.getElementById('playerboard');
    } else if (who === 'opponent') {
      board = document.getElementById('opponentboard');
    }

    const halfRowSpacing = board.clientWidth / 20;
    const halfColumnSpacing = board.clientHeight / 20;

    const pingElement = board.querySelector('.ping-container');

    const rowOffset = (row * 2 - 10 + 1) * halfRowSpacing;
    const columnOffset = (column * 2 - 10 + 1) * halfColumnSpacing;

    pingElement.style.transform = `translate(${columnOffset}px, ${rowOffset}px)`;
    pingElement.style.display = 'block';
    pingElement.classList.add('boardping');
    pingElement.addEventListener(
      'animationend',
      () => {
        pingElement.classList.remove('boardping');
        pingElement.style.display = 'none';
        if (executeAfterPing) executeAfterPing();
      },
      { once: true }
    );
  }

  function displayPlayerHit(row, column) {
    console.log(`cell from dh`);
    messageBox.write('Excellent sir! We got a hit.');
    const cell = getCellFromCoordinates('opponent', row, column);
    cell.classList.add('hit');
  }

  function displayPlayerMiss(row, column) {
    console.log('player miss');
    messageBox.write('Looks like we missed this time.');
    const cell = getCellFromCoordinates('opponent', row, column);
    cell.classList.add('miss');
  }

  function displayOpponentResult(row, column, ship = null) {
    console.log('inside opponent result');
    messageBox.write('Enemy fire commencing...');
    const cell = getCellFromCoordinates('player', row, column);
    const board = document.getElementById('playerboard');
    board.classList.add('boardflash');
    setTimeout(() => {
      pingBoard('player', row, column, () => {
        if (ship) {
          cell.classList.add('hit');
          addHitToHealthStatus(row, column);
          messageBox.write(
            `Ahh! Our ${C.ships[ship.getName()].displayName} has been damaged!`
          );
        } else {
          cell.classList.add('miss');
          messageBox.write('They missed. We were lucky.');
        }
        board.classList.remove('boardflash');
        setTimeout(() => {
          window.dispatchEvent(new Event('ready_for_player_attack'));
        }, 1500);
      });
    }, 1000);
  }

  function addHitToHealthStatus(row, column) {
    const cellObj = p1board.getCell([row, column]);
    const shipName = cellObj.getShip().getName();
    const partNumber = cellObj.getShipPartNumber();

    const healthCell = document.querySelector(
      `.ship-health-container[data-ship="${shipName}"] .health-box[data-shipsection="${partNumber}"]`
    );

    if (!healthCell) return;

    healthCell.classList.add('hit');
  }

  return {
    startAddShipPhase,
    initiateDomForGameLoop,
    playerSelectAttack,
    displayPlayerHit,
    displayPlayerMiss,
    displayOpponentResult,
  };
}
