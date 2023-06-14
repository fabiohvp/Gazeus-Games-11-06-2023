import { DisplayObject, Ticker } from "pixi.js";

export function scaleUp(
  element: DisplayObject,
  options = {
    from: 0,
    duration: 500,
    to: 1,
  },
  callback: Callback = () => {}
) {
  element.scale.set(options.from);

  const ticker = Ticker.shared;
  const onTick = (delta: number) => {
    const deltaMS = delta / Ticker.targetFPMS;
    const increase = deltaMS / options.duration;

    // increase proportionally
    element.scale.set(element.scale.x + increase, element.scale.y + increase);

    if (element.scale.x >= options.to) {
      element.scale.set(options.to);
      ticker.remove(onTick);
      callback();
    }
  };
  ticker.add(onTick);
}
