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
  const spritesheet = await Assets.load("sprite/matchup.json");
  const state = createState(spritesheet);
  await setupAudio(app, state);

  if (import.meta.env.MODE === "development") {
    (globalThis as any).__PIXI_APP__ = app; //necessary for DEVTOOLS
  }

  const welcome = await createWelcome(app, state);
  changeStage(app, welcome, state);

  document.body.appendChild(app.view as any as Node);
}

createApp();

async function setupAudio(app: Application, state: IState) {
  audioManager.mute(state.soundEnabled);

  document.addEventListener("keypress", (event) => {
    if (event.code === "KeyM") {
      // @ts-ignore
      app.stage.emit(EVENT_SOUND_ENABLED);
    }
  });
  return audioManager.load(Object.values(SOUND));
}
