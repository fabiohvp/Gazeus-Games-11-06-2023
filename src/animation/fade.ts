import { DisplayObject, Ticker } from "pixi.js";

const FADE_OUT_DURATION = 150;

export async function fadeIn(element: DisplayObject) {
  element.alpha = 0;

  const ticker = Ticker.shared;
  const onTick = (delta: number) => {
    const deltaMS = delta / Ticker.targetFPMS;
    const increase = deltaMS / FADE_OUT_DURATION;

    element.alpha += increase;

    if (element.alpha >= 1) {
      element.alpha = 1;
      ticker.remove(onTick);
      return Promise.resolve();
    }
  };
  ticker.add(onTick);
}

export function fadeOut(element: DisplayObject) {
  let promiseResolve: IPromiseResolve;
  element.alpha = 1;

  const ticker = Ticker.shared;
  const promise = new Promise<void>((resolve) => {
    promiseResolve = resolve;
  });

  const onTick = (delta: number) => {
    const deltaMS = delta / Ticker.targetFPMS;
    const decrease = deltaMS / FADE_OUT_DURATION;

    element.alpha -= decrease;

    if (element.alpha <= 0) {
      element.alpha = 0;
      ticker.remove(onTick);
      return promiseResolve();
    }
  };
  ticker.add(onTick);
  return promise;
}
