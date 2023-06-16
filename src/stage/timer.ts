import { Application, Container, Sprite, Text, Ticker } from "pixi.js";
import { createText } from "../factory/text";
import {
  EVENT_MATCH_END,
  EVENT_TIMER_START,
  INITIAL_SCORE,
  INITIAL_SLOT_POSITION,
  MATCH_TIME,
  STAGE_NAME,
  STAGE_SIZE,
} from "../game/constant";
import { TEXTURE } from "../game/texture";

export async function createTimer(app: Application, state: IState) {
  const container = new Container();
  container.name = STAGE_NAME.timer;

  const scoreBackground = new Sprite(
    state.spritesheet.textures[TEXTURE.Text_container]
  );
  container.position.set(
    STAGE_SIZE.width - scoreBackground.width - 75,
    INITIAL_SLOT_POSITION.y - scoreBackground.height - 30
  );
  container.addChild(scoreBackground);

  const timeLeftText = createPointsText();
  container.addChild(timeLeftText);
  timeLeftText.position.set(container.width * 0.12, container.height * 0.45);

  const timerText = createScoreText();
  container.addChild(timerText);
  timerText.position.set(container.width * 0.55, container.height * 0.42);

  bindTimerEvents(app, container, timerText, state);
  return container;
}

function bindTimerEvents(
  app: Application,
  container: Container,
  timerText: Text,
  state: IState
) {
  const onTimerStart = createOnTimerStart(app, container, timerText, state);

  // @ts-ignore
  app.stage.on(EVENT_TIMER_START, onTimerStart);

  container.on("destroyed", () => {
    // @ts-ignore
    app.stage.off(EVENT_TIMER_START, onTimerStart);
  });
}

function createOnTimerStart(
  app: Application,
  container: Container,
  timerText: Text,
  state: IState
) {
  let emitMatchEndEvent = false;
  let isMatchRunning = true;
  let timeWithDecimals = 0;
  let time = 0;
  const ticker = Ticker.shared;

  timerText.text = formatTime(0);

  const resetTimer = () => {
    emitMatchEndEvent = false;
    isMatchRunning = true;
    timeWithDecimals = 0;
    time = 0;
    timerText.text = formatTime(time);
  };

  const onTick = (delta: number) => {
    if (isMatchRunning) {
      timeWithDecimals += (1 / 60) * delta;
      time = Math.floor(timeWithDecimals);
      timerText.text = formatTime(time);

      if (time === MATCH_TIME) {
        emitMatchEndEvent = true;
        isMatchRunning = false;
      }
    } else if (!state.scoring) {
      if (emitMatchEndEvent) {
        emitMatchEndEvent = false;
        // @ts-ignore
        app.stage.emit(EVENT_MATCH_END);
      }
    }
  };
  ticker.add(onTick);

  container.on("destroyed", () => {
    // @ts-ignore
    ticker.remove(onTick);
  });

  return resetTimer;
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
