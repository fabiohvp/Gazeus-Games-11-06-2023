import { Application, Container, Spritesheet } from "pixi.js";
import {
  BOARD_SIZE,
  INITIAL_SCORE,
  LOCALSTORAGE_SOUND_ENABLED,
} from "./constant";

export function createState(spritesheet: Spritesheet): IState {
  return {
    currentStage: null,
    score: INITIAL_SCORE,
    scoring: false,
    slots: createSlots(),
    soundEnabled: getSoundEnabled(),
    spritesheet,
    swapEnabled: false,
  };
}

export function changeStage(
  app: Application,
  container: Container,
  state: IState
) {
  if (state.currentStage) {
    app.stage.removeChild(state.currentStage);
    state.currentStage.destroy({ children: true });
  }
  state.currentStage = container;
  app.stage.addChild(container);
}

function createSlots() {
  const slots: IGemSlot[][] = [];

  for (let slotX = 0; slotX < BOARD_SIZE.rows; slotX++) {
    slots.push([]);

    for (let slotY = BOARD_SIZE.columns - 1; slotY >= 0; slotY--) {
      slots[slotX] = [];
    }
  }
  return slots;
}

function getSoundEnabled() {
  const soundEnabled =
    localStorage.getItem(LOCALSTORAGE_SOUND_ENABLED) !== false.toString();
  return soundEnabled;
}
