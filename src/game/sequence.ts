import { compareGemTypes, createGemKey, swapGemsSlots } from "../factory/gem";
import { BOARD_SIZE, GEMS_SEQUENCE_MIN } from "./constant";

export function getPossibleSequences(gemSlot: IGemSlot, state: IState) {
  const previousXSequences = checkSequenceWithPreviousGems(
    gemSlot,
    state,
    (gemSlot, slotIndex) => ({
      slotX: slotIndex - 1,
      slotY: gemSlot.slotY,
    }),
    (gemSlot) => gemSlot.slotX
  );

  const previousYSequences = checkSequenceWithPreviousGems(
    gemSlot,
    state,
    (gemSlot, slotIndex) => ({
      slotX: gemSlot.slotX,
      slotY: slotIndex - 1,
    }),
    (gemSlot) => gemSlot.slotY
  );

  const nextXSequences = checkSequenceWithNextGems(
    gemSlot,
    state,
    (gemSlot, slotIndex) => ({
      slotX: slotIndex + 1,
      slotY: gemSlot.slotY,
    }),
    (gemSlot) => gemSlot.slotX
  );

  const nextYSequences = checkSequenceWithNextGems(
    gemSlot,
    state,
    (gemSlot, slotIndex) => ({
      slotX: gemSlot.slotX,
      slotY: slotIndex + 1,
    }),
    (gemSlot) => gemSlot.slotY
  );

  let validSequences = new Map<string, IGemSlot>();
  const minSequenceSequenceDetect = GEMS_SEQUENCE_MIN - 1;

  if (
    previousYSequences.length + nextYSequences.length >=
    minSequenceSequenceDetect
  ) {
    for (const sequence of Array.prototype.concat(
      previousYSequences,
      nextYSequences
    )) {
      validSequences.set(createGemKey(sequence)!, sequence);
    }
  }

  if (
    previousXSequences.length + nextXSequences.length >=
    minSequenceSequenceDetect
  ) {
    for (const sequence of Array.prototype.concat(
      previousXSequences,
      nextXSequences
    )) {
      validSequences.set(createGemKey(sequence)!, sequence);
    }
  }

  if (validSequences.size < minSequenceSequenceDetect)
    return new Map<string, IGemSlot>();
  validSequences.set(createGemKey(gemSlot)!, gemSlot);
  //return [...validSequences.values()];
  return validSequences;
}

export function getAllPossibleSequences(state: IState) {
  const sequences = new Map<string, IGemSlot>();

  for (let slotX = 0; slotX < BOARD_SIZE.rows; slotX++) {
    for (let slotY = 0; slotY < BOARD_SIZE.columns; slotY++) {
      const tempSequences = getPossibleSequences(
        state.slots[slotX][slotY],
        state
      );

      for (const [key, gemSlot] of tempSequences) {
        sequences.set(key, gemSlot);
      }
    }
  }
  return sequences;
}

export function hasPossibleToMoves(state: IState) {
  return (
    hasPossibleMovesHorizontally(state) || hasPossibleMovesVertically(state)
  );
}

export function hasPossibleMovesHorizontally(state: IState) {
  let hasSequence = false;

  //check horizontal moves
  for (let slotX = 0; slotX < BOARD_SIZE.rows; slotX++) {
    for (let slotY = 0; slotY < BOARD_SIZE.columns - 1; slotY++) {
      const fromX = state.slots[slotX][slotY];
      const toX = state.slots[slotX][slotY + 1];

      swapGemsSlots(fromX, toX);
      hasSequence =
        getPossibleSequences(fromX, state).size > 0 ||
        getPossibleSequences(toX, state).size > 0;
      swapGemsSlots(toX, fromX);

      if (hasSequence) {
        slotX = BOARD_SIZE.rows;
        slotY = BOARD_SIZE.columns;
      }
    }
  }
  return hasSequence;
}

export function hasPossibleMovesVertically(state: IState) {
  let hasSequence = false;

  for (let slotX = 0; slotX < BOARD_SIZE.rows - 1; slotX++) {
    for (let slotY = 0; slotY < BOARD_SIZE.columns; slotY++) {
      const fromY = state.slots[slotX][slotY];
      const toY = state.slots[slotX + 1][slotY];

      swapGemsSlots(fromY, toY);
      hasSequence =
        getPossibleSequences(fromY, state).size > 0 ||
        getPossibleSequences(toY, state).size > 0;
      swapGemsSlots(toY, fromY);

      if (hasSequence) {
        slotX = BOARD_SIZE.rows;
        slotY = BOARD_SIZE.columns;
      }
    }
  }
  return hasSequence;
}

function checkSequenceWithNextGems(
  gemSlot: IGemSlot,
  state: IState,
  createNextGemKeyFn: (gemSlot: IGemSlot, slotIndex: number) => ISlot,
  getSlotIndex: (gemSlot: IGemSlot) => number
) {
  const slotsSequence: IGemSlot[] = [];
  let slotIndex = getSlotIndex(gemSlot);

  while (slotIndex < BOARD_SIZE.columns - 1) {
    const nextSlotKey = createNextGemKeyFn(gemSlot, slotIndex);
    const nextSlot = state.slots[nextSlotKey.slotX][nextSlotKey.slotY];
    const isSameType = compareGemTypes(nextSlot, gemSlot);

    if (isSameType) {
      slotsSequence.push(nextSlot);
    } else {
      slotIndex = BOARD_SIZE.columns;
    }
    slotIndex++;
  }
  return slotsSequence;
}

function checkSequenceWithPreviousGems(
  gemSlot: IGemSlot,
  state: IState,
  createPreviousGemKeyFn: (gemSlot: IGemSlot, slotIndex: number) => ISlot,
  getSlotIndex: (gemSlot: IGemSlot) => number
) {
  const slotsSequence: IGemSlot[] = [];
  let slotIndex = getSlotIndex(gemSlot);

  while (slotIndex > 0) {
    const previousSlotKey = createPreviousGemKeyFn(gemSlot, slotIndex);
    const previousSlot =
      state.slots[previousSlotKey.slotX][previousSlotKey.slotY];
    const isSameType = compareGemTypes(previousSlot, gemSlot);

    if (isSameType) {
      slotsSequence.push(previousSlot);
    } else {
      slotIndex = 0;
    }
    slotIndex--;
  }
  return slotsSequence;
}
