export const c = {
  numberOfPlayers: 2,
  gameboardRows: 10,
  gameboardColumns: 10,
  ships: [
    {
      name: 'Carrier',
      length: 5,
    },
    {
      name: 'Battleship',
      length: 4,
    },
    {
      name: 'Cruiser',
      length: 3,
    },
    {
      name: 'Submarine',
      length: 3,
    },
    {
      name: 'Destroyer',
      length: 2,
    },
  ],
  paths: {
    up: [-1, 0],
    down: [1, 0],
    left: [0, -1],
    right: [0, 1],
  },
};
