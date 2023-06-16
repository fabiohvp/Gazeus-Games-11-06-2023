import { expect, test } from "vitest";
import { shuffleGems } from "../factory/gem";
import { BOARD_SIZE } from "../game/constant";

test("test shuffle creating correct amount of gemSlots", () => {
  const gemSlots = shuffleGems(global.state);
  expect(gemSlots.length).to.equal(BOARD_SIZE.columns * BOARD_SIZE.rows);
});
