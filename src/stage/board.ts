import { GlowFilter } from "@pixi/filter-glow";
import { Container, FederatedPointerEvent, Sprite } from "pixi.js";
import { fadeOut } from "../animation/fade";
import { moveDown } from "../animation/moveDown";
import {
  changeGemType,
  createGemKey,
  getGemCoordinatesFromMouse,
  getGemInitialY,
  getGemSequences,
  shuffleGems,
  swapGemsSlots,
} from "../factory/gem";
import { createSoundButton } from "../factory/soundButton";
import { audioManager } from "../game/AudioManager";
import {
  EVENT_MATCH_END,
  EVENT_SCORE_HIGHEST,
  EVENT_SCORE_UPDATE,
  STAGE_NAME,
} from "../game/constant";
import { SOUND } from "../game/sound";
import { TEXTURE } from "../game/texture";
import { groupBy } from "../utils/groupBy";
import { createMenu } from "./menu";
import { createScore } from "./score";
import { createTimer } from "./timer";

export async function createBoard(state: IState) {
  audioManager.stop();

  const container = new Container();
  container.name = STAGE_NAME.board;
  container.interactive = true;

  const boardBackground = new Sprite(state.spritesheet.textures[TEXTURE.Bg]);
  container.addChild(boardBackground);

  const soundButton = createSoundButton(state);
  container.addChild(soundButton);

  const score = await createScore(state);
  container.addChild(score);

  const timer = await createTimer(state);
  container.addChild(timer);

  bindBoardEvents(container, state);
  createInitialGems(container, state);
  handleMouseEvents(container, state);
  return container;
}

function bindBoardEvents(container: Container, state: IState) {
  const onHighestScore = createOnHighestScore(container, state);
  const onMatchEnd = createOnMatchEnd(container, state);

  // @ts-ignore
  state.app.stage.on(EVENT_SCORE_HIGHEST, onHighestScore);
  // @ts-ignore
  state.app.stage.on(EVENT_MATCH_END, onMatchEnd);

  container.on("destroyed", () => {
    // @ts-ignore
    state.app.stage.off(EVENT_SCORE_HIGHEST, onHighestScore);
    // @ts-ignore
    state.app.stage.off(EVENT_MATCH_END, onMatchEnd);
  });
}

function createInitialGems(container: Container, state: IState) {
  const gemSlots = shuffleGems(state);
  addGems(container, gemSlots, state);
}

async function addGems(
  container: Container,
  gemSlots: IGemSlot[],
  state: IState
) {
  for (const gemSlot of gemSlots) {
    container.addChild(gemSlot.gem);
  }
  await updateGems(gemSlots, state);
  state.swapEnabled = true;
}

async function checkSequence(removedGemSlots: IGemSlot[], state: IState) {
  const promises: Promise<void>[] = [];
  audioManager.play(SOUND.Sequence);

  for (const removedGemSlot of removedGemSlots) {
    promises.push(fadeOut(removedGemSlot.gem));
  }

  await Promise.all(promises);
  removedGemSlots.sort((a, b) => b.slotY - a.slotY);

  let gemsToUpdate: IGemSlot[] = [];
  const groups = groupBy(removedGemSlots, (gemSlot) => gemSlot.slotX);

  for (const [slotX, group] of groups) {
    const removedGemSlots = [...group.values()];
    const removedGemFirstSlotY =
      removedGemSlots[removedGemSlots.length - 1].slotY;
    const removedGemLastSlotY = removedGemSlots[0].slotY;
    let removedGemFillSlotY = removedGemLastSlotY;

    for (let slotY = removedGemFirstSlotY - 1; slotY >= 0; slotY--) {
      gemsToUpdate.push({
        ...state.slots[slotX][slotY],
        slotY: removedGemFillSlotY,
      });
      removedGemFillSlotY--;
    }

    for (
      let slotY = removedGemLastSlotY;
      slotY >= removedGemFirstSlotY;
      slotY--
    ) {
      const newGemSlot = {
        ...state.slots[slotX][slotY],
        slotY: removedGemFillSlotY,
      };
      changeGemType(newGemSlot, state);
      newGemSlot.gem.position.y = getGemInitialY();

      gemsToUpdate.push(newGemSlot);
      removedGemFillSlotY--;
    }
  }
  // @ts-ignore
  state.app.stage.emit(EVENT_SCORE_UPDATE, removedGemSlots.length);
  return updateGems(gemsToUpdate, state);
}

function createOnMatchEnd(container: Container, state: IState) {
  return async function () {
    const menu = await createMenu(container, state);
    container.addChild(menu);
  };
}

function createOnHighestScore(container: Container, state: IState) {
  let firstTimeHighestScore = true;
  return function () {
    const highestScoreIcon = new Sprite(
      state.spritesheet.textures[TEXTURE.Highest_score]
    );
    highestScoreIcon.position.set(259, 18);
    container.addChild(highestScoreIcon);

    if (firstTimeHighestScore) {
      audioManager.play(SOUND.HighestScore);
      firstTimeHighestScore = false;
    }
  };
}

async function updateGems(gemSlots: IGemSlot[], state: IState): Promise<void> {
  const promises: Promise<void>[] = [];

  for (const gemSlot of gemSlots) {
    state.slots[gemSlot.slotX][gemSlot.slotY] = gemSlot;
    gemSlot.gem.alpha = 1;
    promises.push(moveDown(gemSlot));
  }

  await Promise.all(promises);
  return scoreSequences(gemSlots, state);
}

function scoreSequences(gemSlots: IGemSlot[], state: IState) {
  const sequences = new Map<string, IGemSlot>();

  for (const gemSlot of gemSlots) {
    const tempSequences = getGemSequences(gemSlot, state);

    for (const sequence of tempSequences) {
      sequences.set(createGemKey(sequence)!, sequence);
    }
  }

  if (sequences.size) {
    return checkSequence([...sequences.values()], state);
  }
  return Promise.resolve();
}

function handleMouseEvents(element: Container, state: IState) {
  let moving = false;
  let currentGemKey: ISlot | null = null;
  let currentSprite: Sprite;

  const cleanUp = () => {
    currentGemKey = null;
    currentSprite.filters = [];
  };

  const onDragEnd = () => {
    if (!moving) {
      cleanUp();
      state.swapEnabled = true;
    }
    element.off("pointermove", onDragMove);
    element.off("pointerup", onDragEnd);
    element.off("pointerupoutside", onDragEnd);
  };

  const onDragMove = async (event: FederatedPointerEvent) => {
    if (currentGemKey) {
      state.swapEnabled = false;
      const gemSlot = getGemCoordinatesFromMouse(element, event);

      if (!gemSlot) return;

      moving =
        currentGemKey.slotX !== gemSlot.slotX ||
        currentGemKey.slotY !== gemSlot.slotY;

      if (moving) {
        onDragEnd();
        const from = state.slots[currentGemKey.slotX][currentGemKey.slotY];
        const to = state.slots[gemSlot.slotX][gemSlot.slotY];

        await swapGemsSlots(from, to);
        cleanUp();

        const sequences = Array.prototype.concat(
          getGemSequences(from, state),
          getGemSequences(to, state)
        );

        if (sequences.length) {
          await checkSequence(sequences, state);
        } else {
          await swapGemsSlots(to, from);
        }
        state.swapEnabled = true;
      }
    } else {
      moving = false;
    }
  };

  const onDragStart = (event: FederatedPointerEvent) => {
    if (!state.swapEnabled) return;
    currentGemKey = getGemCoordinatesFromMouse(element, event);
    currentSprite = event.target as Sprite;
    currentSprite.filters = [new GlowFilter()];

    element.on("pointermove", onDragMove);
    element.on("pointerup", onDragEnd);
    element.on("pointerupoutside", onDragEnd);
  };

  element.on("pointerdown", onDragStart);
}
