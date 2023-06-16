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
  GEMS,
  GEMS_TYPES_COUNT,
  INITIAL_SLOT_POSITION,
  SLOT_SIZE,
} from "../game/constant";
import { createRandom } from "./random";

export function calculateGemPositionX(slotX: number) {
  return INITIAL_SLOT_POSITION.x + slotX * SLOT_SIZE.width;
}

export function calculateGemPositionY(slotY: number) {
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

export function compareGemTypes(gemSlot1: IGemSlot, gemSlot2: IGemSlot) {
  return gemSlot1.type === gemSlot2.type;
}

export function createGem(type: number, state: IState) {
  const texture = createGemTexture(type, state);
  const gem = new Sprite(texture);
  gem.cursor = "pointer";
  gem.alpha = 0;
  gem.eventMode = "static";
  return gem;
}

export function createGemKey(slot: ISlot | null) {
  if (!slot) return null;
  return `${slot.slotX}-${slot.slotY}`;
}

export function createGemTexture(type: number, state: IState) {
  return state.spritesheet.textures[GEMS[type - 1]];
}

export function createGemSlot(slot: ISlot, state: IState) {
  const type = createGemType();
  const gem = createGem(type, state);
  const gemSlot = { type, gem, ...slot };
  gemSlot.gem.position.set(calculateGemPositionX(slot.slotX), getGemInitialY());
  return gemSlot;
}

export function createGemType() {
  return createRandom(1, GEMS_TYPES_COUNT);
}

export function getGemPositionFromSlot(slot: ISlot) {
  return {
    x: calculateGemPositionX(slot.slotX),
    y: calculateGemPositionY(slot.slotY),
  };
}

export function getGemSlotFromMouse(
  container: Container,
  event: FederatedPointerEvent
) {
  const position = event.getLocalPosition(container);

  if (
    position.x < INITIAL_SLOT_POSITION.x ||
    position.x > FINAL_SLOT_POSITION.x
  )
    return null;
  if (
    position.y < INITIAL_SLOT_POSITION.y ||
    position.y > FINAL_SLOT_POSITION.y
  )
    return null;

  const slotX = calculateGemSlotX(position.x);
  const slotY = calculateGemSlotY(position.y);

  if (slotX < 0 || slotY < 0) return null;
  return { slotX, slotY };
}

export function getGemInitialY() {
  return INITIAL_SLOT_POSITION.y - SLOT_SIZE.height / GEMS_TYPES_COUNT;
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
  const gemFrom = from.gem;
  const typeFrom = from.type;

  from.gem = to.gem;
  from.type = to.type;

  to.gem = gemFrom;
  to.type = typeFrom;
}

export async function swapGemsSlotsAnimated(from: IGemSlot, to: IGemSlot) {
  await swap(from, to);
  swapGemsSlots(from, to);
}
