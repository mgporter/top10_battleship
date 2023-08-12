import Player from './player';
import DomManager from './dom';
import { doRandomAttack, FollowUpAttack } from './attack';
import { C } from './constants';

export default function LogicController() {
  // Debugging flags
  let skipShipPlacement = false;
  let showEnemyShips = false;
  let showPlayerShips = false;
  let skipToEndGameDialog = false;
  let skipPlayerAttacks = false;
  let playerGoesFirst = true; // This is not set up yet
  C.gameSpeed = 1;

  window.addEventListener('keydown', (e) => {
    if (e.key === 'q') {
      showEndOfGameDialog();
    }
  });

  window.addEventListener('gamespeed_change', (e) => {
    const value = e.detail.value;
    C.gameSpeed = value;
    document.documentElement.style.setProperty('--game-speed', C.gameSpeed);
  });

  document.documentElement.style.setProperty('--game-speed', C.gameSpeed);

  let rows, columns, player1, player2, p1board, p2board, dom;

  initialize();

  function initialize() {
    document.body.textContent = '';

    // Create players
    rows = C.gameboardRows;
    columns = C.gameboardColumns;
    player1 = Player(rows, columns);
    player2 = Player(rows, columns);

    p1board = player1.getBoard();
    p2board = player2.getBoard();

    // Build DOM
    dom = DomManager(player1, player2);
  }

  // Start add ship phase once all models are loaded
  window.addEventListener('all_models_loaded', () => {
    dom.startAddShipPhase();
  });

  window.addEventListener('ship_placed', (e) => {
    const shipName = e.detail.shipName;
    const targetShip = player1.getShipByName(shipName);
    p1board.placeShip(targetShip, e.detail.coordinates, e.detail.direction);
  });

  if (skipShipPlacement) {
    setTimeout(() => {
      window.dispatchEvent(new Event('start_game'));
    }, 1000);
  }

  if (skipToEndGameDialog) {
    setTimeout(() => {
      showEndOfGameDialog();
    }, 1000);
  }

  // Start the game loop when the user presses the red start button
  window.addEventListener('start_game', () => {
    player2.autoPlaceShips();
    startGame();
  });

  function startGame() {
    dom.initiateDomForGameLoop();
    console.log('start game in lc');
    window.addEventListener('dom_ready_for_game_loop', playerAttack, {
      once: true,
    });
  }

  function playerAttack() {
    if (!skipPlayerAttacks) {
      dom.playerSelectAttack();
    } else {
      window.dispatchEvent(
        new CustomEvent('player_target_selected', {
          detail: { row: 0, column: 0 },
        })
      );
    }

    if (showEnemyShips) {
      showShipsOnBoard('opponent');
    }
    if (showPlayerShips) {
      showShipsOnBoard('player');
    }
  }

  function showShipsOnBoard(who) {
    if (who === 'opponent') {
      player2.getShips().forEach((ship) => {
        dom.displayShipOnOpponentBoard(ship);
      });
      p2board.getCells().forEach((row, i) => {
        row.forEach((cell, j) => {
          if (cell.hasShip()) {
            const cell = dom.getCellFromCoordinates('opponent', i, j);
            cell.classList.add('hit');
          }
        });
      });
      showEnemyShips = false; // make sure this only runs once
    } else if (who === 'player') {
      p1board.getCells().forEach((row, i) => {
        row.forEach((cell, j) => {
          if (cell.hasShip()) {
            const cell = dom.getCellFromCoordinates('player', i, j);
            cell.classList.add('hit');
          }
        });
      });
      showPlayerShips = false; // make sure this only runs once
    }
  }

  window.addEventListener('player_target_selected', (e) => {
    const row = e.detail.row;
    const column = e.detail.column;
    console.log(`player attacked at ${row} and ${column}`);
    let ship;
    if (!skipPlayerAttacks) ship = p2board.receiveAttack([row, column]);

    if (ship) {
      if (ship.isSunk()) {
        dom.displayPlayerHitAfterSink(row, column, ship);
      } else {
        dom.displayPlayerHit(row, column);
      }
    } else {
      dom.displayPlayerMiss(row, column);
    }

    // After the player's attack, we check to see if the last ship was sunk.
    const shipReport = p2board.getShipReport();
    if (
      shipReport.shipsTotal === shipReport.shipsSunk &&
      shipReport.shipsTotal !== 0
    ) {
      showEndOfGameDialog('player');
    } else {
      setTimeout(enemyAttack, 2000 * C.gameSpeed);
    }
  });

  window.addEventListener('ready_for_player_attack', () => {
    console.log('window received ready for player attack event');

    // After the enemy attack, this event is fired. So we check to see if the enemy sunk the last ship
    const shipReport = p1board.getShipReport();
    if (
      shipReport.shipsSunk === shipReport.shipsTotal &&
      shipReport.shipsTotal !== 0
    ) {
      showEndOfGameDialog('opponent');
    } else {
      playerAttack();
    }
  });

  let followUpAttackResult = null;
  let followUpAttack = null;

  function enemyAttack() {
    let ship, attackCoordinates;
    if (
      followUpAttack &&
      (!followUpAttackResult || !followUpAttackResult.isSunk())
    ) {
      // while there is a follow-up attack going on and the target ship is not
      // sunk yet, do this. This is the 'follow up attack' loop.
      try {
        attackCoordinates = followUpAttack.attack(followUpAttackResult);
      } catch (e) {
        // This is a complex algorithm. If an error is thrown, we just abandon the follow-up attack
        console.log(e.message);
        followUpAttackResult = null;
        followUpAttack = null;
        commenceRandomAttack();
      }

      if (!attackCoordinates) {
        // If the attack coordinates are null, then the algorithm just couldn't figure
        // out where to attack next. In this case, we need to go back to random attacks.
        followUpAttackResult = null;
        followUpAttack = null;
        commenceRandomAttack();
      } else {
        followUpAttackResult = p1board.receiveAttack(attackCoordinates);
        ship = followUpAttackResult;
      }
    } else if (followUpAttackResult && followUpAttackResult.isSunk()) {
      // When the target ship is sunk, we go here to reset the variables and go back to random attacks
      followUpAttackResult = null;
      followUpAttack = null;
      commenceRandomAttack();
    } else {
      // This is the normal random attack loop that will be used most of the time
      commenceRandomAttack();
    }

    function commenceRandomAttack() {
      attackCoordinates = doRandomAttack(p1board);
      ship = p1board.receiveAttack(attackCoordinates);

      // If there was a hit, we need to load up the FollowUpAttack object, which will
      // also send us into the follow-up attack loop next time.
      if (ship) {
        followUpAttack = FollowUpAttack(p1board, attackCoordinates);
      }
    }

    // 'ship' will be null if there was a miss, so the result function will check
    // that to know what message to tell the player
    dom.displayOpponentResult(attackCoordinates[0], attackCoordinates[1], ship);
    // After the displayOpponentHit/Miss functions run, they will send the 'ready_for_player_attack' event back
  }

  function showEndOfGameDialog(winner = 'player') {
    dom.disableInteractivity();
    dom.generateEndOfGameReport(winner);
  }

  /* 
  Last features:
  Attribution dialog
  */
}
