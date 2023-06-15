//1 = roxo
//2 = verde
//3 = vermelho
//4 = laranja
//5 = azul
import { Container, FederatedPointerEvent, Sprite } from "pixi.js";
import { swap } from "../animation/swap";
import {
  BOARD_SIZE,
  FINAL_SLOT_POSITION,
  GEMS_SEQUENCE_MIN,
  GEMS_TYPES_COUNT,
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

export function changeGemType(gemSlot: IGemSlot, state: IState) {
  gemSlot.type = createGemType();
  gemSlot.gem.texture = createGemTexture(gemSlot.type, state);
}

export function createGemTexture(type: number, state: IState) {
  return state.spritesheet.textures[GEMS[type - 1]];
}

export function createGem(type: number, state: IState) {
  const texture = createGemTexture(type, state);
  const gem = new Sprite(texture);
  gem.cursor = "pointer";
  gem.alpha = 0;
  gem.interactive = true;
  return gem;
}

export function createGemSlot(slot: ISlot, state: IState) {
  const type = createGemType();
  const gem = createGem(type, state);
  const gemSlot = { type, gem, ...slot };
  gemSlot.gem.position.set(
    calculateGemCoordinateX(slot.slotX),
    getGemInitialY()
  );
  return gemSlot;
}

export function createGemKey(slot: ISlot | null) {
  if (!slot) return null;
  return `${slot.slotX}-${slot.slotY}`;
}

export function createGemType() {
  return createRandom(1, 5);
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

export function getGemCoordinatesFromSlot(slot: ISlot) {
  return {
    x: calculateGemCoordinateX(slot.slotX),
    y: calculateGemCoordinateY(slot.slotY),
  };
}

export function shuffleGems(state: IState) {
  const gemSlots: IGemSlot[] = [];

  for (let slotX = 0; slotX < BOARD_SIZE.rows; slotX++) {
    for (let slotY = BOARD_SIZE.columns - 1; slotY >= 0; slotY--) {
      const gemSlot = createGemSlot({ slotX, slotY }, state);
      gemSlots.push(gemSlot);
    }
  }
  return gemSlots;
}

export async function swapGemsSlots(from: IGemSlot, to: IGemSlot) {
  await swap(from, to);
  const gemFrom = from.gem;
  const typeFrom = from.type;

  from.gem = to.gem;
  from.type = to.type;

  to.gem = gemFrom;
  to.type = typeFrom;
}

export function getGemSequences(gemSlot: IGemSlot, state: IState) {
  const previousXSequences = checkSequenceWithPreviousGems(
    gemSlot,
    state,
    (gemSlot, slotIndex) => ({
      slotX: slotIndex - 1,
      slotY: gemSlot.slotY,
    }),
    (gemSlot) => gemSlot.slotX
  );

  const previousYSequences = checkSequenceWithPreviousGems(
    gemSlot,
    state,
    (gemSlot, slotIndex) => ({
      slotX: gemSlot.slotX,
      slotY: slotIndex - 1,
    }),
    (gemSlot) => gemSlot.slotY
  );

  const nextXSequences = checkSequenceWithNextGems(
    gemSlot,
    state,
    (gemSlot, slotIndex) => ({
      slotX: slotIndex + 1,
      slotY: gemSlot.slotY,
    }),
    (gemSlot) => gemSlot.slotX
  );

  const nextYSequences = checkSequenceWithNextGems(
    gemSlot,
    state,
    (gemSlot, slotIndex) => ({
      slotX: gemSlot.slotX,
      slotY: slotIndex + 1,
    }),
    (gemSlot) => gemSlot.slotY
  );

  let validSequences = new Map<string, IGemSlot>();
  const minSequenceSequenceDetect = GEMS_SEQUENCE_MIN - 1;

  if (
    previousYSequences.length + nextYSequences.length >=
    minSequenceSequenceDetect
  ) {
    for (const sequence of Array.prototype.concat(
      previousYSequences,
      nextYSequences
    )) {
      validSequences.set(createGemKey(sequence)!, sequence);
    }
  }

  if (
    previousXSequences.length + nextXSequences.length >=
    minSequenceSequenceDetect
  ) {
    for (const sequence of Array.prototype.concat(
      previousXSequences,
      nextXSequences
    )) {
      validSequences.set(createGemKey(sequence)!, sequence);
    }
  }

  if (validSequences.size < minSequenceSequenceDetect) return [];
  validSequences.set(createGemKey(gemSlot)!, gemSlot);
  return [...validSequences.values()];
}

export function getGemInitialY() {
  return INITIAL_SLOT_POSITION.y - SLOT_SIZE.height / GEMS_TYPES_COUNT;
}

function checkSequenceWithPreviousGems(
  gemSlot: IGemSlot,
  state: IState,
  createPreviousGemKeyFn: (gemSlot: IGemSlot, slotIndex: number) => ISlot,
  getSlotIndex: (gemSlot: IGemSlot) => number
) {
  const slotsSequence: IGemSlot[] = [];
  let slotIndex = getSlotIndex(gemSlot);

  while (slotIndex > 0) {
    const previousSlotKey = createPreviousGemKeyFn(gemSlot, slotIndex);
    const previousSlot =
      state.slots[previousSlotKey.slotX][previousSlotKey.slotY];
    const isSameType = compareGemTypes(previousSlot, gemSlot);

    if (isSameType) {
      slotsSequence.push(previousSlot);
    } else {
      slotIndex = 0;
    }
    slotIndex--;
  }
  return slotsSequence;
}

function checkSequenceWithNextGems(
  gemSlot: IGemSlot,
  state: IState,
  createNextGemKeyFn: (gemSlot: IGemSlot, slotIndex: number) => ISlot,
  getSlotIndex: (gemSlot: IGemSlot) => number
) {
  const slotsSequence: IGemSlot[] = [];
  let slotIndex = getSlotIndex(gemSlot);

  while (slotIndex < BOARD_SIZE.columns - 1) {
    const nextSlotKey = createNextGemKeyFn(gemSlot, slotIndex);
    const nextSlot = state.slots[nextSlotKey.slotX][nextSlotKey.slotY];
    const isSameType = compareGemTypes(nextSlot, gemSlot);

    if (isSameType) {
      slotsSequence.push(nextSlot);
    } else {
      slotIndex = BOARD_SIZE.columns;
    }
    slotIndex++;
  }
  return slotsSequence;
}

function compareGemTypes(gemSlot1: IGemSlot, gemSlot2: IGemSlot) {
  return gemSlot1.type === gemSlot2.type;
}
