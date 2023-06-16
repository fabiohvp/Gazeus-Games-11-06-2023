import { expect, test } from "vitest";
import { createGemSlot } from "../factory/gem";
import { BOARD_SIZE } from "../game/constant";
import { getAllPossibleSequences } from "../game/sequence";

test("test without possible sequences", () => {
  for (let slotX = 0; slotX < BOARD_SIZE.rows; slotX++) {
    for (let slotY = BOARD_SIZE.columns - 1; slotY >= 0; slotY--) {
      const gemSlot = createGemSlot({ slotX, slotY }, global.state);

      let type = 1;

      if (gemSlot.slotX % 2 === 0) {
        if (gemSlot.slotY % 2 === 0) {
          type = 2;
        } else {
          type = 3;
        }
      } else {
        if (gemSlot.slotY % 2 === 0) {
          type = 4;
        } else {
          type = 5;
        }
      }
      gemSlot.type = type;
      global.state.slots[slotX][slotY] = gemSlot;
    }
  }
  const sequences = getAllPossibleSequences(global.state);
  expect(sequences.size).to.equal(0);
});

test("test with possible sequences", () => {
  for (let slotX = 0; slotX < BOARD_SIZE.rows; slotX++) {
    for (let slotY = BOARD_SIZE.columns - 1; slotY >= 0; slotY--) {
      const gemSlot = createGemSlot({ slotX, slotY }, global.state);

      if (gemSlot.slotX === 0) {
        gemSlot.type = 1;
      }
      global.state.slots[slotX][slotY] = gemSlot;
    }
  }
  const sequences = getAllPossibleSequences(global.state);
  expect(sequences.size).not.equal(0);
});
