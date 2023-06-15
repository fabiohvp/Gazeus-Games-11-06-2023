import { Container, Sprite, Text, Ticker } from "pixi.js";
import { createText } from "../factory/text";
import {
  EVENT_MATCH_END,
  EVENT_TIMER_START,
  FINAL_SLOT_POSITION,
  INITIAL_SCORE,
  INITIAL_SLOT_POSITION,
  MATCH_TIME,
  STAGE_NAME,
} from "../game/constant";
import { TEXTURE } from "../game/texture";

export async function createTimer(state: IState) {
  const container = new Container();
  container.name = STAGE_NAME.timer;

  const scoreBackground = new Sprite(
    state.spritesheet.textures[TEXTURE.Text_container]
  );
  container.position.set(
    FINAL_SLOT_POSITION.x - scoreBackground.width + 25,
    INITIAL_SLOT_POSITION.y - scoreBackground.height - 30
  );
  container.addChild(scoreBackground);

  const timeLeftText = createPointsText();
  container.addChild(timeLeftText);
  timeLeftText.position.set(container.width * 0.12, container.height * 0.45);

  const timerText = createScoreText();
  container.addChild(timerText);
  timerText.position.set(container.width * 0.55, container.height * 0.42);

  bindTimerEvents(timerText, state);
  startTime(timerText, state);
  return container;
}

function bindTimerEvents(timerText: Text, state: IState) {
  // @ts-ignore
  state.app.stage.on(EVENT_TIMER_START, createOnTimerStart(timerText, state));
}

function createOnTimerStart(timerText: Text, state: IState) {
  return function () {
    console.log("timer");
    startTime(timerText, state);
  };
}

function createPointsText() {
  const text = createText("Timer left:", 14);
  text.anchor.set(0, 0.5);
  return text;
}

function createScoreText() {
  const text = createText(INITIAL_SCORE.toLocaleString(), 22);
  text.anchor.set(0, 0.5);
  return text;
}

function formatTime(time: number) {
  let totalSeconds = MATCH_TIME - time;
  totalSeconds %= 3600;
  let minutes = Math.floor(totalSeconds / 60);
  let seconds = totalSeconds % 60;

  return (
    minutes.toLocaleString().padStart(2, "0") +
    ":" +
    seconds.toLocaleString().padStart(2, "0")
  );
}

function startTime(timerText: Text, state: IState) {
  let timeWithDecimals = 0;
  let time = 0;
  let lastTime = 0;
  const ticker = Ticker.shared;

  timerText.text = formatTime(0);

  const onTick = (delta: number) => {
    timeWithDecimals += (1 / 60) * delta;
    time = Math.floor(timeWithDecimals);

    if (lastTime !== time) {
      timerText.text = formatTime(time);

      if (time === MATCH_TIME) {
        ticker.remove(onTick);
        // @ts-ignore
        state.app.stage.emit(EVENT_MATCH_END);
      }
      lastTime = time;
    }
  };
  ticker.add(onTick);
}
