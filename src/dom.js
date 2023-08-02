export default function buildDom() {
  function buildPlayerBoard() {
    const playerBoard = document.getElementById('playerboard');

    for (let i = 0; i < 100; i++) {
      const cell = document.createElement('div');
      cell.className = 'cell playerboard';
      playerBoard.appendChild(cell);
    }
  }

  function buildOpponentBoard() {
    const opponentBoard = document.getElementById('opponentboard');

    for (let i = 0; i < 100; i++) {
      const cell = document.createElement('div');
      cell.className = 'cell opponentboard';
      opponentBoard.appendChild(cell);
    }
  }

  return {
    buildPlayerBoard,
    buildOpponentBoard,
  };
}
