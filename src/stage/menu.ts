import { Container, Sprite } from "pixi.js";
import { createButton } from "../factory/button";
import { changeGemType } from "../factory/gem";
import { createText } from "../factory/text";
import {
  EVENT_SCORE_UPDATE,
  EVENT_TIMER_START,
  INITIAL_SCORE,
  STAGE_NAME,
} from "../game/constant";
import { TEXTURE } from "../game/texture";

export async function createMenu(parentContainer: Container, state: IState) {
  const container = new Container();
  container.name = STAGE_NAME.menu;

  container.addChild(
    new Sprite(state.spritesheet.textures[TEXTURE.Pause_menu])
  );
  container.height = state.app.screen.height / 2;
  container.width = state.app.screen.width / 2;

  container.position.x = container.width / 2;
  container.position.y = container.height / 2;

  const title = createTitle();
  container.addChild(title);

  const scoreText = createScoreText(state);
  container.addChild(scoreText);

  const playButton = createPlayButton(container, parentContainer, state);
  container.addChild(playButton);

  state.swapEnabled = false;
  return container;
}

function createPlayButton(
  container: Container,
  parentContainer: Container,
  state: IState
) {
  const text = createText("Restart", 24);
  text.anchor.set(0.5, -0.25);

  const button = createButton(TEXTURE.Button_down, TEXTURE.Button_up, state);
  button.position.set(container.width * 0.28, 200);
  button.addChild(text);

  button.on("pointerup", async () => {
    state.score = INITIAL_SCORE;
    // @ts-ignore
    state.app.stage.emit(EVENT_SCORE_UPDATE, state.score);

    for (let slotX = 0; slotX < state.slots.length; slotX++) {
      for (let slotY = 0; slotY < state.slots.length; slotY++) {
        changeGemType(state.slots[slotX][slotY], state);
      }
    }
    parentContainer.removeChild(container);
    state.swapEnabled = true;
    // @ts-ignore
    state.app.stage.emit(EVENT_TIMER_START);
  });
  return button;
}

function createScoreText(state: IState) {
  const text = createText(`Score: ${state.score}`, 16);
  text.position.x = 15;
  text.position.y = 100;
  return text;
}

function createTitle() {
  const text = createText("Game ended", 20);
  text.position.x = 15;
  text.position.y = 17;
  return text;
}
