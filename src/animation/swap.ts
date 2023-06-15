import { Ticker } from "pixi.js";

const SWAP_SPEED = 5;

export async function swap(from: IGemSlot, to: IGemSlot) {
  let promiseResolve: IPromiseResolve;
  const fromOriginalPosition = {
    x: from.gem.position.x,
    y: from.gem.position.y,
  };
  const modifier = from.slotX > to.slotX || from.slotY > to.slotY ? -1 : 1;

  const ticker = Ticker.shared;
  const promise = new Promise<void>((resolve) => {
    promiseResolve = resolve;
  });

  const onTick = () => {
    if (from.slotX !== to.slotX) {
      from.gem.position.x += SWAP_SPEED * modifier;
      to.gem.position.x -= SWAP_SPEED * modifier;

      if (to.gem.position.x === fromOriginalPosition.x) {
        ticker.remove(onTick);
        return promiseResolve();
      }
    } else {
      from.gem.position.y += SWAP_SPEED * modifier;
      to.gem.position.y -= SWAP_SPEED * modifier;

      if (to.gem.position.y === fromOriginalPosition.y) {
        ticker.remove(onTick);
        return promiseResolve();
      }
    }
  };
  ticker.add(onTick);
  return promise;
}
