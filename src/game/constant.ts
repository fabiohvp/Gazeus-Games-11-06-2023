export const STAGE_NAME = {
  board: "board",
  menu: "menu",
};

export const GEMS_TYPES_COUNT = 5;

export const BOARD_SIZE = { columns: 8, rows: 8 };
export const GEM_DESTRUCTION_FADE_OUT_DURATION_MS = 150;
export const SLOT_SIZE = { height: 50, width: 50 };

export const INITIAL_SLOT_POSITION = { x: 100, y: 100 };
export const FINAL_SLOT_POSITION = {
  x: INITIAL_SLOT_POSITION.x + BOARD_SIZE.columns * SLOT_SIZE.width,
  y: INITIAL_SLOT_POSITION.y + BOARD_SIZE.rows * SLOT_SIZE.height,
};
