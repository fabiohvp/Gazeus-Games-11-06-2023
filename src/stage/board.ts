import { GlowFilter } from "@pixi/filter-glow";
import { Application, Container, FederatedPointerEvent, Sprite } from "pixi.js";
import { fadeOut } from "../animation/fade";
import { moveDown } from "../animation/moveDown";
import {
  changeGemType,
  getGemInitialY,
  getGemSlotFromMouse,
  shuffleGems,
  swapGemsSlotsAnimated,
} from "../factory/gem";
import { createSoundButton } from "../factory/soundButton";
import { audioManager } from "../game/AudioManager";
import {
  EVENT_MATCH_END,
  EVENT_MATCH_RESTART,
  EVENT_SCORE_HIGHEST,
  EVENT_SCORE_UPDATE,
  EVENT_TIMER_START,
  INITIAL_SCORE,
  SPRITE_NAME,
  STAGE_NAME,
} from "../game/constant";
import {
  getAllPossibleSequences,
  getPossibleSequences,
  hasPossibleToMoves,
} from "../game/sequence";
import { SOUND } from "../game/sound";
import { TEXTURE } from "../game/texture";
import { groupBy } from "../utils/groupBy";
import { wait } from "../utils/wait";
import { createMenu } from "./menu";
import { createScore } from "./score";
import { createTimer } from "./timer";

export async function createBoard(app: Application, state: IState) {
  audioManager.stop();

  const container = new Container();
  container.name = STAGE_NAME.board;
  container.eventMode = "static";

  const boardBackground = new Sprite(state.spritesheet.textures[TEXTURE.Bg]);
  container.addChild(boardBackground);

  const soundButton = createSoundButton(app, state);
  container.addChild(soundButton);

  const score = await createScore(app, state);
  container.addChild(score);

  const timer = await createTimer(app, state);
  container.addChild(timer);

  await startMatch(app, container, state);
  bindBoardEvents(app, container, state);
  createInitialGems(app, container, state);
  handleMouseEvents(app, container, state);
  return container;
}

async function addGems(
  app: Application,
  container: Container,
  gemSlots: IGemSlot[],
  state: IState
) {
  for (const gemSlot of gemSlots) {
    container.addChild(gemSlot.gem);
  }
  await renderBoard(app, gemSlots, state);
}

function bindBoardEvents(
  app: Application,
  container: Container,
  state: IState
) {
  const onHighestScore = createOnHighestScore(container, state);
  const onMatchEnd = createOnMatchEnd(app, container, state);
  const onRestartMatch = createOnRestartMatch(app, container, state);

  // @ts-ignore
  app.stage.on(EVENT_SCORE_HIGHEST, onHighestScore);
  // @ts-ignore
  app.stage.on(EVENT_MATCH_END, onMatchEnd);
  // @ts-ignore
  app.stage.on(EVENT_MATCH_RESTART, onRestartMatch);

  container.on("destroyed", () => {
    // @ts-ignore
    app.stage.off(EVENT_SCORE_HIGHEST, onHighestScore);
    // @ts-ignore
    app.stage.off(EVENT_MATCH_END, onMatchEnd);
    // @ts-ignore
    app.stage.off(EVENT_MATCH_RESTART, onRestartMatch);
  });
}

function createInitialGems(
  app: Application,
  container: Container,
  state: IState
) {
  const gemSlots = shuffleGems(state);
  addGems(app, container, gemSlots, state);
}

function createOnHighestScore(container: Container, state: IState) {
  return async function () {
    if (container.getChildByName(SPRITE_NAME.highestScore)) return;

    const highestScoreSprite = new Sprite(
      state.spritesheet.textures[TEXTURE.Highest_score]
    );
    highestScoreSprite.name = SPRITE_NAME.highestScore;
    highestScoreSprite.position.set(259, 18);
    container.addChild(highestScoreSprite);

    audioManager.play(SOUND.HighestScore, true);
  };
}

function createOnMatchEnd(
  app: Application,
  container: Container,
  state: IState
) {
  return async function () {
    const menu = await createMenu(app, container, state);
    container.addChild(menu);
  };
}

function createOnRestartMatch(
  app: Application,
  container: Container,
  state: IState
) {
  return async function () {
    await startMatch(app, container, state);
    await resetBoard(app, state);
  };
}

function handleMouseEvents(
  app: Application,
  element: Container,
  state: IState
) {
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
      const gemSlot = getGemSlotFromMouse(element, event);

      if (!gemSlot) return;

      moving =
        currentGemKey.slotX !== gemSlot.slotX ||
        currentGemKey.slotY !== gemSlot.slotY;

      if (moving) {
        onDragEnd();
        const from = state.slots[currentGemKey.slotX][currentGemKey.slotY];
        const to = state.slots[gemSlot.slotX][gemSlot.slotY];

        await swapGemsSlotsAnimated(from, to);
        cleanUp();

        const sequences = new Map([
          ...getPossibleSequences(from, state),
          ...getPossibleSequences(to, state),
        ]);

        if (sequences.size) {
          await updateScore(app, sequences, state);
        } else {
          await swapGemsSlotsAnimated(to, from);
        }
        state.swapEnabled = true;
      }
    } else {
      moving = false;
    }
  };

  const onDragStart = (event: FederatedPointerEvent) => {
    if (!state.swapEnabled) return;
    if (state.scoring) return;
    moving = false;
    currentGemKey = getGemSlotFromMouse(element, event);
    currentSprite = event.target as Sprite;
    currentSprite.filters = [new GlowFilter()];

    element.on("pointermove", onDragMove);
    element.on("pointerup", onDragEnd);
    element.on("pointerupoutside", onDragEnd);
  };

  element.on("pointerdown", onDragStart);
}

async function renderBoard(
  app: Application,
  gemSlots: IGemSlot[],
  state: IState
): Promise<void> {
  const promises: Promise<void>[] = [];

  for (const gemSlot of gemSlots) {
    state.slots[gemSlot.slotX][gemSlot.slotY] = gemSlot;
    gemSlot.gem.alpha = 1;
    promises.push(moveDown(gemSlot));
  }

  await Promise.all(promises);
  await runPossibleMoves(app, state);
  state.swapEnabled = true;
}

async function resetBoard(app: Application, state: IState) {
  const gemSlots: IGemSlot[] = [];

  for (let slotX = 0; slotX < state.slots.length; slotX++) {
    for (let slotY = 0; slotY < state.slots.length; slotY++) {
      changeGemType(state.slots[slotX][slotY], state);
      gemSlots.push(state.slots[slotX][slotY]);
    }
  }
  await renderBoard(app, gemSlots, state);
}

async function runPossibleMoves(app: Application, state: IState) {
  const sequences = getAllPossibleSequences(state);

  if (sequences.size) {
    return updateScore(app, sequences, state);
  }
  const hasSequence = hasPossibleToMoves(state);

  if (!hasSequence) {
    await wait(500);
    return resetBoard(app, state);
  }
}

async function startMatch(
  app: Application,
  container: Container,
  state: IState
) {
  state.score = INITIAL_SCORE;
  // @ts-ignore
  app.stage.emit(EVENT_SCORE_UPDATE, state.score);
  // @ts-ignore
  app.stage.emit(EVENT_TIMER_START);

  let highestScoreSprite = container.getChildByName(SPRITE_NAME.highestScore);
  highestScoreSprite?.removeFromParent();
}

async function updateScore(
  app: Application,
  gemSlots: Map<string, IGemSlot>,
  state: IState
) {
  state.scoring = true;
  const promises: Promise<void>[] = [];
  audioManager.play(SOUND.Sequence);
  const removedGemSlots = [...gemSlots.values()];

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
  app.stage.emit(EVENT_SCORE_UPDATE, removedGemSlots.length);
  await renderBoard(app, gemsToUpdate, state);
  state.scoring = false;
}
