import { Ticker } from "pixi.js";
import { calculateGemPositionY } from "../factory/gem";

const MOVE_DOWN_SPEED = 2;

export function moveDown(gemSlot: IGemSlot) {
  let promiseResolve: IPromiseResolve;
  let animationsSlotIndex = 0;

  const ticker = Ticker.shared;
  const promise = new Promise<void>((resolve) => {
    promiseResolve = resolve;
  });

  const onTick = (delta: number) => {
    const deltaMS = delta / Ticker.targetFPMS;
    const increase = deltaMS / MOVE_DOWN_SPEED;

    const finalY = calculateGemPositionY(gemSlot.slotY);

    if (gemSlot.gem.position.y < finalY) {
      gemSlot.gem.position.y += increase;
    } else {
      gemSlot.gem.position.y = finalY;
      ticker.remove(onTick);
      return promiseResolve();
    }
    animationsSlotIndex++;
  };
  ticker.add(onTick);
  return promise;
}
