import { Ticker } from "pixi.js";
import { calculateGemCoordinateY, calculateGemSlotY } from "../factory/gem";
import { BOARD_SIZE } from "../game/constant";
import { groupBy } from "../utils/groupBy";

const SLOT_LAST_INDEX = BOARD_SIZE.columns - 1;
const MOVE_SPEED = 10;

export function moveDown(gemSlots: GemSlot[], callback: Callback = () => {}) {
  const groups = groupBy(gemSlots, (gemSlot) => gemSlot.slotX);
  let animationsSlotIndex = 0;

  const ticker = Ticker.shared;
  const onTick = () => {
    let currentSlotY = animationsSlotIndex;
    let finished = false;

    for (
      let currentAnimationSlotIndex = 0;
      currentAnimationSlotIndex <= animationsSlotIndex;
      currentAnimationSlotIndex++
    ) {
      for (const [, group] of groups) {
        const gemSlot = group[currentAnimationSlotIndex];
        gemSlot.gem.visible = true;

        const finalY = calculateGemCoordinateY(gemSlot.slotY);
        currentSlotY = calculateGemSlotY(gemSlot.gem.position.y);

        if (gemSlot.gem.position.y < finalY) {
          gemSlot.gem.position.y += MOVE_SPEED;
        } else if (currentAnimationSlotIndex === SLOT_LAST_INDEX) {
          finished = true;
        }
      }
    }

    if (currentSlotY > 0) {
      animationsSlotIndex++;
    }

    if (finished) {
      ticker.remove(onTick);
      callback();
    }
  };
  ticker.add(onTick);
}
