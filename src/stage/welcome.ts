import { Container, Sprite } from "pixi.js";
import { scaleUp } from "../animation/scale";
import { createButton } from "../factory/button";
import { createSoundButton } from "../factory/soundButton";
import { createText } from "../factory/text";
import { audioManager } from "../game/AudioManager";
import { STAGE_NAME } from "../game/constant";
import { SOUND } from "../game/sound";
import { changeStage } from "../game/state";
import { TEXTURE } from "../game/texture";
import { createBoard } from "./board";

export async function createWelcome(state: IState) {
  const container = new Container();
  container.name = STAGE_NAME.welcome;

  const titleBackground = new Sprite(
    state.spritesheet.textures[TEXTURE.Title_bg]
  );
  container.addChild(titleBackground);

  const soundButton = createSoundButton(state);
  container.addChild(soundButton);

  const title = createTitle(state);
  container.addChild(title);
  scaleUp(title);

  const playButton = createPlayButton(state);
  container.addChild(playButton);
  scaleUp(playButton);

  if (state.soundEnabled) {
    const onMouseClick = () => {
      document.removeEventListener("click", onMouseClick);

      if (state.app.stage.children[0].name !== STAGE_NAME.welcome) return;

      audioManager.play(SOUND.Welcome);
      audioManager.loop();
    };
    document.addEventListener("click", onMouseClick);
  }
  return container;
}

function createPlayButton(state: IState) {
  const text = createText("Play", 42);
  text.anchor.set(0.5, -0.25);

  const button = createButton(
    TEXTURE.Large_button_down,
    TEXTURE.Large_button_up,
    state
  );
  button.position.set(state.app.screen.width / 2, 260);
  button.addChild(text);

  button.on("pointerup", async () => {
    const board = await createBoard(state);
    changeStage(board, state);
  });
  return button;
}

function createTitle(state: IState) {
  const title = new Sprite(state.spritesheet.textures[TEXTURE.Title]);
  title.anchor.set(0.5, 0);
  title.position.set(state.app.screen.width / 2, 130);
  return title;
}
