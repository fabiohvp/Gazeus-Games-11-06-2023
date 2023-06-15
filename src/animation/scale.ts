import { DisplayObject, Ticker } from "pixi.js";

const SCALE_UP_DURATION = 500;

export async function scaleUp(
  element: DisplayObject,
  options = {
    from: 0,
    to: 1,
  }
) {
  let promiseResolve: IPromiseResolve;
  element.scale.set(options.from);

  const ticker = Ticker.shared;
  const promise = new Promise<void>((resolve) => {
    promiseResolve = resolve;
  });

  const onTick = (delta: number) => {
    const deltaMS = delta / Ticker.targetFPMS;
    const increase = deltaMS / SCALE_UP_DURATION;

    element.scale.set(element.scale.x + increase, element.scale.y + increase);

    if (element.scale.x >= options.to) {
      element.scale.set(options.to);
      ticker.remove(onTick);
      return promiseResolve();
    }
  };
  ticker.add(onTick);
  return promise;
}
