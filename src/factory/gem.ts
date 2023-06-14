import { Container, FederatedPointerEvent, Sprite } from "pixi.js";
import { swap } from "../animation/swap";
import {
  BOARD_SIZE,
  FINAL_SLOT_POSITION,
  INITIAL_SLOT_POSITION,
  SLOT_SIZE,
} from "../game/constant";
import { TEXTURE } from "../game/texture";
import { createRandom } from "./random";

const GEMS = [
  TEXTURE.Gem1,
  TEXTURE.Gem2,
  TEXTURE.Gem3,
  TEXTURE.Gem4,
  TEXTURE.Gem5,
];

export function calculateGemCoordinateX(slotX: number) {
  return INITIAL_SLOT_POSITION.x + slotX * SLOT_SIZE.width;
}

export function calculateGemCoordinateY(slotY: number) {
  return INITIAL_SLOT_POSITION.y + slotY * SLOT_SIZE.height;
}

export function calculateGemSlotX(x: number) {
  return Math.floor((x / SLOT_SIZE.width - 1) % (BOARD_SIZE.rows + 1)) - 1;
}

export function calculateGemSlotY(y: number) {
  return Math.floor((y / SLOT_SIZE.height - 1) % (BOARD_SIZE.columns + 1)) - 1;
}

export function createGem(state: State, textureIndex: number) {
  const gem = new Sprite(state.spritesheet.textures[GEMS[textureIndex - 1]]);
  gem.cursor = "pointer";
  gem.visible = false;
  gem.interactive = true;
  return gem;
}

export function createGemKey(coordinates: Slot | null) {
  if (!coordinates) return null;
  return `${coordinates.slotX}-${coordinates.slotY}`;
}

export function getGemCoordinatesFromMouse(
  container: Container,
  event: FederatedPointerEvent
) {
  const coordinates = event.getLocalPosition(container);

  if (
    coordinates.x < INITIAL_SLOT_POSITION.x ||
    coordinates.x > FINAL_SLOT_POSITION.x
  )
    return null;
  if (
    coordinates.y < INITIAL_SLOT_POSITION.y ||
    coordinates.y > FINAL_SLOT_POSITION.y
  )
    return null;

  const slotX = calculateGemSlotX(coordinates.x);
  const slotY = calculateGemSlotY(coordinates.y);

  if (slotX < 0 || slotY < 0) return null;
  return { slotX, slotY };
}

export function getGemCoordinatesFromSlot(slot: Slot) {
  return {
    x: calculateGemCoordinateX(slot.slotX),
    y: calculateGemCoordinateY(slot.slotY),
  };
}

export function shuffleGems(state: State) {
  const gemSlots: GemSlot[] = [];

  for (let slotX = 0; slotX < BOARD_SIZE.rows; slotX++) {
    for (let slotY = BOARD_SIZE.columns - 1; slotY >= 0; slotY--) {
      const type = createRandom(1, 5);
      const gem = createGem(state, type);
      const gemSlot = { type, gem, slotX, slotY };
      gemSlots.push(gemSlot);
    }
  }
  return gemSlots;
}

export function swapGems(
  keyFrom: Slot,
  keyTo: Slot,
  state: State,
  swapBack = false
) {
  state.swaping = true;
  const from = state.slots[keyFrom.slotX][keyFrom.slotY];
  const to = state.slots[keyTo.slotX][keyTo.slotY];

  swap(from, to, () => {
    const fromX = from.slotX;
    const fromY = from.slotY;
    from.slotX = to.slotX;
    from.slotY = to.slotY;
    to.slotX = fromX;
    to.slotY = fromY;

    state.slots[keyFrom.slotX][keyFrom.slotY] = to;
    state.slots[keyTo.slotX][keyTo.slotY] = from;

    if (swapBack) {
      state.swaping = false;
    } else {
      if (from.type === to.type) {
        swapGems(keyTo, keyFrom, state, true);
      } else {
        const collisions = Array.prototype.concat(
          getGemCollisions(from, state),
          getGemCollisions(to, state)
        );

        if (collisions.length) {
          // @ts-ignore
          state.app.stage.emit("remove-gems", collisions);
        } else {
          swapGems(keyTo, keyFrom, state, true);
        }
        state.swaping = false;
      }
    }
  });
}
//1 = roxo
//2 = verde
//3 = vermelho
//4 = laranja
//5 = azul

export function getGemCollisions(gemSlot: GemSlot, state: State) {
  const previousXCollisions = checkCollisionWithPreviousGems(
    gemSlot,
    state,
    (gemSlot, slotIndex) => ({
      slotX: slotIndex - 1,
      slotY: gemSlot.slotY,
    }),
    (gemSlot) => gemSlot.slotX
  );

  const previousYCollisions = checkCollisionWithPreviousGems(
    gemSlot,
    state,
    (gemSlot, slotIndex) => ({
      slotX: gemSlot.slotX,
      slotY: slotIndex - 1,
    }),
    (gemSlot) => gemSlot.slotY
  );

  const nextXCollisions = checkCollisionWithNextGems(
    gemSlot,
    state,
    (gemSlot, slotIndex) => ({
      slotX: slotIndex + 1,
      slotY: gemSlot.slotY,
    }),
    (gemSlot) => gemSlot.slotX
  );

  const nextYCollisions = checkCollisionWithNextGems(
    gemSlot,
    state,
    (gemSlot, slotIndex) => ({
      slotX: gemSlot.slotX,
      slotY: slotIndex + 1,
    }),
    (gemSlot) => gemSlot.slotY
  );

  let validCollisions: GemSlot[] = [];

  if (previousYCollisions.length + nextYCollisions.length >= 2) {
    validCollisions = Array.prototype.concat(
      ...previousYCollisions,
      gemSlot,
      ...nextYCollisions
    );
  }

  if (previousXCollisions.length + nextXCollisions.length >= 2) {
    validCollisions = Array.prototype.concat(
      ...validCollisions,
      ...previousXCollisions,
      gemSlot,
      ...nextXCollisions
    );
  }

  if (validCollisions.length < 3) return [];
  validCollisions.sort((a, b) => b.slotY - a.slotY);
  return validCollisions;
}

function checkCollisionWithPreviousGems(
  gemSlot: GemSlot,
  state: State,
  createPreviousGemKeyFn: (gemSlot: GemSlot, slotIndex: number) => Slot,
  getSlotIndex: (gemSlot: GemSlot) => number
) {
  const slotsCollision: GemSlot[] = [];
  let slotIndex = getSlotIndex(gemSlot);

  while (slotIndex > 0) {
    const previousSlotKey = createPreviousGemKeyFn(gemSlot, slotIndex);
    const previousSlot =
      state.slots[previousSlotKey.slotX][previousSlotKey.slotY];
    const isSameType = compareGemTypes(previousSlot, gemSlot);

    if (isSameType) {
      slotsCollision.push(previousSlot);
    } else {
      slotIndex = 0;
    }
    slotIndex--;
  }
  return slotsCollision;
}

function checkCollisionWithNextGems(
  gemSlot: GemSlot,
  state: State,
  createNextGemKeyFn: (gemSlot: GemSlot, slotIndex: number) => Slot,
  getSlotIndex: (gemSlot: GemSlot) => number
) {
  const slotsCollision: GemSlot[] = [];
  let slotIndex = getSlotIndex(gemSlot);

  while (slotIndex < BOARD_SIZE.columns - 1) {
    const nextSlotKey = createNextGemKeyFn(gemSlot, slotIndex);
    const nextSlot = state.slots[nextSlotKey.slotX][nextSlotKey.slotY];
    const isSameType = compareGemTypes(nextSlot, gemSlot);

    if (isSameType) {
      slotsCollision.push(nextSlot);
    } else {
      slotIndex = BOARD_SIZE.columns;
    }
    slotIndex++;
  }
  return slotsCollision;
}

function compareGemTypes(gemSlot1: GemSlot, gemSlot2: GemSlot) {
  return gemSlot1.type === gemSlot2.type;
}
