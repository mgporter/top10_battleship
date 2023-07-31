export default function Cell() {
  let hasShip = false;
  let ship = null;
  let alreadyHit = false;

  function addShip(newShip) {
    if (hasShip) {
      throw new Error('Cannot place a ship on top of an existing ship');
    } else {
      hasShip = true;
      ship = newShip;
    }
  }

  function getShip() {
    return ship;
  }

  function addHit() {
    if (alreadyHit) {
      throw new Error('Cannot target a space that has already been targeted');
    } else {
      // Return the ship if one is here, otherwise return null
      alreadyHit = true;
      if (hasShip) return ship;
      return null;
    }
  }

  return {
    hasShip,
    alreadyHit,
    addShip,
    getShip,
    addHit,
  };
}

module.exports = Cell;
