export default function Ship(name, length) {
  let hits = 0;
  let shipId = null;
  let isPlaced = false;
  let direction = '';
  let startingCoordinates = [];

  function getName() {
    return name;
  }

  function getLength() {
    return length;
  }

  function setId(id) {
    shipId = id;
  }

  function getId() {
    return shipId;
  }

  function hit() {
    hits += 1;
  }

  function getHitCount() {
    return hits;
  }

  function isSunk() {
    return hits < length ? false : true;
  }

  return {
    getName,
    getLength,
    setId,
    getId,
    hit,
    getHitCount,
    isSunk,
    isPlaced,
    direction,
    startingCoordinates,
  };
}
