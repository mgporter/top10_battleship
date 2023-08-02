import { doRandomAttack, FollowUpAttack } from './attack';
import Gameboard from './gameboard';
import Ship from './ship';
import { c } from './constants';

test('auto attack finds random unattacked spot', () => {
  const board = Gameboard(2, 3);
  board.receiveAttack([1, 0]);
  board.receiveAttack([1, 1]);
  board.receiveAttack([1, 2]);

  const attack1 = doRandomAttack(board);
  expect([
    [0, 0],
    [0, 1],
    [0, 2],
  ]).toContainEqual(attack1);
  board.receiveAttack(attack1);

  const attack2 = doRandomAttack(board);
  expect([
    [0, 0],
    [0, 1],
    [0, 2],
  ]).toContainEqual(attack2);
  board.receiveAttack(attack2);
  expect(attack2).not.toEqual(attack1);

  const attack3 = doRandomAttack(board);
  expect([
    [0, 0],
    [0, 1],
    [0, 2],
  ]).toContainEqual(attack3);
  expect(attack3).not.toEqual(attack2);
  expect(attack3).not.toEqual(attack1);
});

test('follow up attack searches around the first hit', () => {
  const board = Gameboard(10, 10);
  const cruiser = Ship(c.ships[2].name, c.ships[2].length);
  board.placeShip(cruiser, [3, 4], [4, 4], [5, 4]);
  let originalDamagedShip = board.receiveAttack([5, 4]);
  const followUp = FollowUpAttack(board, [5, 4]);

  const newCoordinates = followUp.attack();
  let damagedShip = board.receiveAttack(newCoordinates);

  expect([
    [4, 4],
    [6, 4],
    [5, 3],
    [5, 5],
  ]).toContainEqual(newCoordinates);
});

test('follow up attack searches around the second hit', () => {
  const board = Gameboard(10, 10);
  const cruiser = Ship(c.ships[2].name, c.ships[2].length);
  board.placeShip(cruiser, [3, 4], [4, 4], [5, 4]);
  let originalDamagedShip = board.receiveAttack([5, 4]);
  const followUp = FollowUpAttack(board, [5, 4]);

  let coordinates1 = followUp.attack();
  let damagedShip = board.receiveAttack(coordinates1);

  let coordinates2;
  if (!damagedShip) {
    coordinates2 = followUp.attack();
    damagedShip = board.receiveAttack(coordinates2);
    expect(coordinates2).not.toEqual(coordinates1);
    expect([
      [4, 4],
      [6, 4],
      [5, 3],
      [5, 5],
    ]).toContainEqual(coordinates2);
  }
});

test('follow up attack until ship is sunk', () => {
  const board = Gameboard(10, 10);
  const cruiser = Ship(c.ships[2].name, c.ships[2].length);
  board.placeShip(cruiser, [3, 4], [4, 4], [5, 4]);
  let originalDamagedShip = board.receiveAttack([5, 4]);
  const followUp = FollowUpAttack(board, [5, 4]);

  const followupattack = jest.fn(followUp.attack);

  let result, coordinates1;
  do {
    coordinates1 = followupattack();
    result = board.receiveAttack(coordinates1);
  } while (!result);

  while (!result.isSunk()) {
    coordinates1 = followupattack(true);
    result = board.receiveAttack(coordinates1);
  }

  expect(result.isSunk()).toEqual(true);
  expect(followupattack.mock.calls.length).toBeLessThan(6);
});

test('follow up attack even after reverse direction', () => {
  const board = Gameboard(10, 10);
  const cruiser = Ship(c.ships[2].name, c.ships[2].length);
  board.placeShip(cruiser, [3, 4], [4, 4], [5, 4]);
  let originalDamagedShip = board.receiveAttack([4, 4]);
  const followUp = FollowUpAttack(board, [4, 4]);

  const followupattack = jest.fn(followUp.attack);

  let result, coordinates1, sunk;
  do {
    coordinates1 = followupattack(result);
    result = board.receiveAttack(coordinates1);
  } while (!result || !result.isSunk());

  expect(result.isSunk()).toEqual(true);
  expect(followupattack.mock.calls.length).toBeLessThan(6);
});

test('follow up attack even after reverse direction - longer ship', () => {
  const board = Gameboard(10, 10);
  const carrier = Ship(c.ships[0].name, c.ships[0].length);
  board.placeShip(carrier, [7, 8], [6, 8], [5, 8], [4, 8], [3, 8]);
  let originalDamagedShip = board.receiveAttack([6, 8]);
  const followUp = FollowUpAttack(board, [6, 8]);

  const followupattack = jest.fn(followUp.attack);

  let result, coordinates1;
  do {
    coordinates1 = followupattack(result);
    result = board.receiveAttack(coordinates1);
  } while (!result || !result.isSunk());

  expect(result.isSunk()).toEqual(true);
  expect(followupattack.mock.calls.length).toBeLessThan(8);
});
