import Player from './player';
import DomManager from './dom';
import { doRandomAttack, FollowUpAttack } from './attack';
import { C } from './constants';

export default function LogicController() {
  // Create players
  const rows = C.gameboardRows;
  const columns = C.gameboardColumns;
  const player1 = Player(rows, columns);
  const player2 = Player(rows, columns);

  const p1board = player1.getBoard();
  const p2board = player2.getBoard();

  let playerGoesFirst = true;

  // Build DOM
  const dom = DomManager(player1, player2);

  // Start add ship phase once all models are loaded
  window.addEventListener('all_models_loaded', () => {
    dom.startAddShipPhase();
  });

  window.addEventListener('ship_placed', (e) => {
    const shipName = e.detail.shipName;
    const targetShip = player1.getShipByName(shipName);
    p1board.placeShip(targetShip, e.detail.coordinates);
  });

  // setTimeout(() => {
  //   window.dispatchEvent(new Event('start_game'));
  // }, 1000);

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
    dom.playerSelectAttack();
  }

  window.addEventListener('player_target_selected', (e) => {
    const row = e.detail.row;
    const column = e.detail.column;
    console.log(`player attacked at ${row} and ${column}`);
    const ship = p2board.receiveAttack([row, column]);

    if (ship) {
      dom.displayPlayerHit(row, column);
    } else {
      dom.displayPlayerMiss(row, column);
    }
    setTimeout(enemyAttack, 2000);
  });

  window.addEventListener('ready_for_player_attack', () => {
    console.log('window received ready for player attack event');
    playerAttack();
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
        console.log(e);
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
      attackCoordinates = doRandomAttack(p1board);
      ship = p1board.receiveAttack(attackCoordinates);
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

  /* 
  Game loop

  opponent places ships: get random coordinates/direction, find if ship can be placed, then place

  Write message instructions to player to fire
  Player selects spot to shoot
  Shooting animation
  opponent board: Cell is highlighted gray with tiny x (miss), or red with tiny circle (hit)
  message to player on result
  log to lower right side aside

  Message to player that comp is firing
  flash targeted square
  square turns gray or red
  message to player on result
  log to lower right side

  Continue loop

  If enemy ship sunk: picture of ship is placed on opponent board
  message to player

  If player ship sunk;
  ship turns upside down
  */
}
