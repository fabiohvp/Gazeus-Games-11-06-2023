import { Container, Sprite } from "pixi.js";
import { scaleUp } from "../animation/scale";
import { createButton } from "../factory/button";
import { createText } from "../factory/text";
import { changeStage } from "../game/state";
import { TEXTURE } from "../game/texture";
import { createBoard } from "./board";

export async function createWelcome(state: State) {
  const container = new Container();

  const titleBackground = new Sprite(
    state.spritesheet.textures[TEXTURE.Title_bg]
  );
  container.addChild(titleBackground);

  const title = createTitle(state);
  container.addChild(title);
  scaleUp(title);

  const playButton = createPlayButton(state);
  container.addChild(playButton);
  scaleUp(playButton);

  return container;
}

function createPlayButton(state: State) {
  const text = createText("Play", 42);
  text.anchor.set(0.5, -0.25);

  const button = createButton(TEXTURE.Large_btn_up, state);
  button.position.set(state.app.screen.width / 2, 260);
  button.addChild(text);

  button.on("pointerup", async () => {
    const board = await createBoard(state);
    changeStage(board, state);
  });
  return button;
}

function createTitle(state: State) {
  const title = new Sprite(state.spritesheet.textures[TEXTURE.Title]);
  title.anchor.set(0.5, 0);
  title.position.set(state.app.screen.width / 2, 130);
  return title;
}
