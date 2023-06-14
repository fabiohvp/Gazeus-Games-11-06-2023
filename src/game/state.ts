import { Application, Container, ICanvas, Spritesheet } from "pixi.js";
import { BOARD_SIZE } from "./constant";

export function createState(
  app: Application<ICanvas>,
  spritesheet: Spritesheet
): State {
  const slots: GemSlot[][] = [];

  for (let slotX = 0; slotX < BOARD_SIZE.rows; slotX++) {
    slots.push([]);

    for (let slotY = BOARD_SIZE.columns - 1; slotY >= 0; slotY--) {
      slots[slotX] = [];
    }
  }

  return {
    app,
    currentStage: null,
    score: 0,
    slots,
    spritesheet,
    swaping: false,
  };
}

export function changeStage(container: Container, state: State) {
  if (state.currentStage) {
    state.app.stage.removeChild(state.currentStage);
  }
  state.currentStage = container;
  state.app.stage.addChild(container);
}
