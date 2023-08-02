import Ship from './ship';

test('reports name', () => {
  const testShip = Ship('battleship', 4);
  expect(testShip.getName()).toBe('battleship');
});

test('reports length', () => {
  const testShip = Ship('battleship', 4);
  expect(testShip.getLength()).toBe(4);
});

test('takes a hit', () => {
  const testShip = Ship('battleship', 4);
  testShip.hit();
  expect(testShip.getHitCount()).toBe(1);
});

test('reports not sunk yet', () => {
  const testShip = Ship('battleship', 4);
  testShip.hit();
  testShip.hit();
  testShip.hit();
  expect(testShip.isSunk()).toBe(false);
});

test('reports isSunk', () => {
  const testShip = Ship('battleship', 4);
  testShip.hit();
  testShip.hit();
  testShip.hit();
  testShip.hit();
  expect(testShip.isSunk()).toBe(true);
});
