import { Application, Sprite } from "pixi.js";
import { audioManager } from "../game/AudioManager";
import {
  EVENT_SOUND_ENABLED,
  LOCALSTORAGE_SOUND_ENABLED,
  STAGE_SIZE,
} from "../game/constant";
import { TEXTURE } from "../game/texture";

export function createSoundButton(app: Application, state: IState) {
  const soundButton = new Sprite(getTexture(state));
  soundButton.anchor.set(0.5, 0);
  soundButton.cursor = "pointer";
  soundButton.eventMode = "static";
  soundButton.position.set(STAGE_SIZE.width - soundButton.width + 5, 23);

  soundButton.on("pointerup", () => {
    // @ts-ignore
    app.stage.emit(EVENT_SOUND_ENABLED);
  });

  const onSoundEnabled = () => {
    state.soundEnabled = !state.soundEnabled;
    soundButton.texture = getTexture(state);
    audioManager.mute(state.soundEnabled);

    localStorage.setItem(
      LOCALSTORAGE_SOUND_ENABLED,
      state.soundEnabled.toString()
    );
  };

  // @ts-ignore
  app.stage.on(EVENT_SOUND_ENABLED, onSoundEnabled);

  soundButton.on("destroyed", () => {
    // @ts-ignore
    app.stage.off(EVENT_SOUND_ENABLED, onSoundEnabled);
  });

  return soundButton;
}

function getTexture(state: IState) {
  return state.soundEnabled
    ? state.spritesheet.textures[TEXTURE.Sound_on]
    : state.spritesheet.textures[TEXTURE.Sound_off];
}
