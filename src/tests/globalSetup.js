import { afterAll, beforeAll } from "vitest";
import { createState } from "../game/state";
import { CustomSpritesheet } from "./types";

beforeAll(async () => {
  const spritesheet = new CustomSpritesheet();
  await spritesheet.load("../../../public/sprite/matchup.json");
  global.state = createState(spritesheet);
});

afterAll(() => {
  delete global.state;
});
