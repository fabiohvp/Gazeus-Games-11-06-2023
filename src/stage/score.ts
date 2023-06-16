import { Application, Container, Sprite, Text } from "pixi.js";
import { createText } from "../factory/text";
import {
  EVENT_SCORE_HIGHEST,
  EVENT_SCORE_UPDATE,
  INITIAL_SCORE,
  INITIAL_SLOT_POSITION,
  LOCALSTORAGE_HIGHEST_SCORE,
  STAGE_NAME,
} from "../game/constant";
import { TEXTURE } from "../game/texture";

export async function createScore(app: Application, state: IState) {
  const container = new Container();
  container.name = STAGE_NAME.score;

  const scoreBackground = new Sprite(
    state.spritesheet.textures[TEXTURE.Text_container]
  );
  container.position.set(
    INITIAL_SLOT_POSITION.x - 25,
    INITIAL_SLOT_POSITION.y - scoreBackground.height - 30
  );
  container.addChild(scoreBackground);

  const pointsText = createPointsText();
  container.addChild(pointsText);
  pointsText.position.set(container.width * 0.75, container.height * 0.45);

  const scoreText = createScoreText();
  container.addChild(scoreText);
  scoreText.position.set(container.width * 0.65, container.height * 0.42);

  bindScoreEvents(app, scoreText, state);
  return container;
}

function bindScoreEvents(app: Application, scoreText: Text, state: IState) {
  // @ts-ignore
  app.stage.on(EVENT_SCORE_UPDATE, createOnUpdateScore(app, scoreText, state));
}

function createOnUpdateScore(app: Application, scoreText: Text, state: IState) {
  return function (value: number) {
    state.score += value;
    scoreText.text = state.score.toLocaleString();

    const highestScore = parseInt(
      localStorage.getItem(LOCALSTORAGE_HIGHEST_SCORE) ?? "0"
    );

    if (state.score > highestScore) {
      localStorage.setItem(
        LOCALSTORAGE_HIGHEST_SCORE,
        state.score.toLocaleString()
      );
      // @ts-ignore
      app.stage.emit(EVENT_SCORE_HIGHEST, state.score);
    }
  };
}

function createPointsText() {
  const text = createText("Pts", 14);
  text.anchor.set(0, 0.5);
  return text;
}

function createScoreText() {
  const text = createText(INITIAL_SCORE.toLocaleString(), 22);
  text.anchor.set(1, 0.5);
  return text;
}
