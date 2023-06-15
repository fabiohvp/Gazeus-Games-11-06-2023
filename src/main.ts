import { Application, Assets } from "pixi.js";
import { audioManager } from "./game/AudioManager";
import { EVENT_SOUND_ENABLED, STAGE_SIZE } from "./game/constant";
import { SOUND } from "./game/sound";
import { changeStage, createState } from "./game/state";
import { createWelcome } from "./stage/welcome";

async function createApp() {
  const app = new Application({
    ...STAGE_SIZE,
  });

  if (import.meta.env.MODE === "development") {
    (globalThis as any).__PIXI_APP__ = app; //necessary for DEVTOOLS
  }

  const spritesheet = await loadSpritesheet();
  const state = createState(app, spritesheet);
  await setupAudio(state);

  const welcome = await createWelcome(state);
  changeStage(welcome, state);

  document.body.appendChild(app.view as any as Node);
}

createApp();

async function loadSpritesheet() {
  return Assets.load("sprite/matchup.json");
}

async function setupAudio(state: IState) {
  document.addEventListener("keypress", (event) => {
    if (event.code === "KeyM") {
      // @ts-ignore
      state.app.stage.emit(EVENT_SOUND_ENABLED);
    }
  });
  return audioManager.load(Object.values(SOUND));
}
