// const Cell = require('./cell');
import Cell from './cell';

test('reports null on miss', () => {
  const cell = Cell();
  expect(cell.addHit()).toBe(null);
});

test('reports ship id on hit', () => {
  const cell = Cell();
  cell.addShip(3);
  expect(cell.addHit()).toBe(3);
});

test("doesn't allow multiple misses", () => {
  const cell = Cell();
  expect(cell.addHit()).toBe(null);
  expect(() => cell.addHit()).toThrow(Error);
});

test("doesn't allow multiple hits", () => {
  const cell = Cell();
  cell.addShip(3);
  expect(cell.addHit()).toBe(3);
  expect(() => cell.addHit()).toThrow(Error);
});
