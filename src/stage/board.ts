import { Container, FederatedPointerEvent, Sprite } from "pixi.js";
import { fadeOut } from "../animation/fadeOut";
import { moveDown } from "../animation/moveDown";
import {
  getGemCoordinatesFromMouse,
  getGemCoordinatesFromSlot,
  shuffleGems,
  swapGems,
} from "../factory/gem";
import {
  GEMS_TYPES_COUNT,
  GEM_DESTRUCTION_FADE_OUT_DURATION_MS,
  INITIAL_SLOT_POSITION,
  SLOT_SIZE,
  STAGE_NAME,
} from "../game/constant";
import { TEXTURE } from "../game/texture";
import { groupBy } from "../utils/groupBy";

export async function createBoard(state: State) {
  const container = new Container();
  container.name = STAGE_NAME.board;
  container.interactive = true;

  const boardBackground = new Sprite(state.spritesheet.textures[TEXTURE.Bg]);
  container.addChild(boardBackground);

  bindGemsEvents(container, state);
  createInitialGems(state);
  handleMouseEvents(container, state);
  return container;
}

function bindGemsEvents(container: Container, state: State) {
  const onAddGems = createOnAddGems(container, state);
  const onRemoveGems = createOnRemoveGems(container, state);

  state.app.stage.on("destroyed", () => {
    // @ts-ignore
    state.app.stage.removeEventListener("add-gems", onAddGems);
    // @ts-ignore
    state.app.stage.removeEventListener("remove-gems", onRemoveGems);
  });
  // @ts-ignore
  state.app.stage.addEventListener("add-gems", onAddGems);
  // @ts-ignore
  state.app.stage.addEventListener("remove-gems", onRemoveGems);
}

function createInitialGems(state: State) {
  const gemSlots = shuffleGems(state);

  for (const gemSlot of gemSlots) {
    const coordinates = getGemCoordinatesFromSlot(gemSlot);
    gemSlot.gem.position.set(
      coordinates.x,
      INITIAL_SLOT_POSITION.y - SLOT_SIZE.height / GEMS_TYPES_COUNT
    );
  }
  // @ts-ignore
  state.app.stage.emit("add-gems", gemSlots);
}

function createOnAddGems(container: Container, state: State) {
  return function (gemSlots: GemSlot[]) {
    state.swaping = true;

    for (const gemSlot of gemSlots) {
      state.slots[gemSlot.slotX][gemSlot.slotY] = gemSlot;
      container.addChild(gemSlot.gem);
    }
    moveDown(gemSlots, () => {
      state.swaping = false;
    });
  };
}

function createOnRemoveGems(container: Container, state: State) {
  return function (gemSlots: GemSlot[]) {
    const gems = gemSlots.map((slot) => slot.gem);
    state.swaping = true;

    const groups = groupBy(gemSlots, (gemSlot) => gemSlot.slotX);

    fadeOut(gems, GEM_DESTRUCTION_FADE_OUT_DURATION_MS, () => {
      let gemSlotsToMoveDown = new Map<number, GemSlot[]>();

      for (const [slotX, group] of groups) {
        const slotsY = group.map((slot) => slot.slotY);
        const minSlotY = Math.min(...slotsY);
        const maxSlotY = Math.max(...slotsY);

        const tempGemSlotsToMoveDown: GemSlot[] = [];
        let slotY = minSlotY - 1;

        while (slotY >= 0) {
          // const previousSlotKey = createGemKey({
          //   slotX,
          //   slotY,
          // })!;
          //tempGemSlotsToMoveDown.push(state.gems.get(previousSlotKey)!);
          tempGemSlotsToMoveDown.push(state.slots[slotX][slotY]);
          slotY--;
        }
        gemSlotsToMoveDown.set(maxSlotY, tempGemSlotsToMoveDown);
      }
      console.log([...gemSlotsToMoveDown]);
      // moveDown(gemSlotsToMoveDown, () => {
      //   state.swaping = false;
      // });
    });
  };
}

function handleMouseEvents(element: Container, state: State) {
  let currentGemKey: Slot | null = null;

  const onDragEnd = () => {
    currentGemKey = null;

    element.removeEventListener("pointermove", onDragMove);
    element.removeEventListener("pointerup", onDragEnd);
    element.removeEventListener("pointerupoutside", onDragEnd);
  };

  const onDragMove = (event: FederatedPointerEvent) => {
    if (currentGemKey) {
      const gemSlot = getGemCoordinatesFromMouse(element, event);

      if (
        gemSlot &&
        (currentGemKey.slotX !== gemSlot.slotX ||
          currentGemKey.slotY !== gemSlot.slotY)
      ) {
        swapGems(currentGemKey, gemSlot, state);
        return onDragEnd();
      }
    }
  };

  const onDragStart = (event: FederatedPointerEvent) => {
    if (state.swaping) return;
    currentGemKey = getGemCoordinatesFromMouse(element, event);

    element.addEventListener("pointermove", onDragMove);
    element.addEventListener("pointerup", onDragEnd);
    element.addEventListener("pointerupoutside", onDragEnd);
  };

  element.addEventListener("pointerdown", onDragStart);
}
