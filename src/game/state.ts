import { Application, Container, ICanvas, Spritesheet } from "pixi.js";
import { audioManager } from "./AudioManager";
import {
  BOARD_SIZE,
  INITIAL_SCORE,
  LOCALSTORAGE_SOUND_ENABLED,
} from "./constant";

export function createState(
  app: Application<ICanvas>,
  spritesheet: Spritesheet
): IState {
  const soundEnabled = getSoundEnabled();
  audioManager.mute(soundEnabled);

  return {
    app,
    currentStage: null,
    score: INITIAL_SCORE,
    slots: createSlots(),
    soundEnabled,
    spritesheet,
    swapEnabled: false,
  };
}

export function changeStage(container: Container, state: IState) {
  if (state.currentStage) {
    state.app.stage.removeChild(state.currentStage);
    state.currentStage.destroy({ children: true });
  }
  state.currentStage = container;
  state.app.stage.addChild(container);
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
