import { DisplayObject, Ticker } from "pixi.js";

export function fadeOut(
  elements: DisplayObject[],
  duration: number,
  callback: Callback = () => {}
) {
  elements.forEach((element) => (element.alpha = 1));
  //element.alpha = 1;

  const ticker = Ticker.shared;
  const onTick = (delta: number) => {
    const deltaMS = delta / Ticker.targetFPMS;
    const decrease = deltaMS / duration;

    // decrease proportionally
    elements.forEach((element) => (element.alpha -= decrease));

    if (elements[0].alpha <= 0) {
      ticker.remove(onTick);
      callback();
    }
  };
  ticker.add(onTick);
}
