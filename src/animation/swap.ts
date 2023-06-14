import { Ticker } from "pixi.js";

const SWAP_SPEED = 5;

export function swap(
  from: GemSlot,
  to: GemSlot,
  callback: Callback = () => {}
) {
  const fromOriginalPosition = {
    x: from.gem.position.x,
    y: from.gem.position.y,
  };
  const modifier = from.slotX > to.slotX || from.slotY > to.slotY ? -1 : 1;

  const ticker = Ticker.shared;
  const onTick = () => {
    if (from.slotX !== to.slotX) {
      from.gem.position.x += SWAP_SPEED * modifier;
      to.gem.position.x -= SWAP_SPEED * modifier;

      if (to.gem.position.x === fromOriginalPosition.x) {
        ticker.remove(onTick);
        callback();
      }
    } else {
      from.gem.position.y += SWAP_SPEED * modifier;
      to.gem.position.y -= SWAP_SPEED * modifier;

      if (to.gem.position.y === fromOriginalPosition.y) {
        ticker.remove(onTick);
        callback();
      }
    }
    //};
  };
  ticker.add(onTick);
}
