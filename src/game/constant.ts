export const STAGE_NAME = {
  board: "board",
  menu: "menu",
  score: "score",
  timer: "timer",
  welcome: "welcome",
};

export const MATCH_TIME = 60; //seconds
export const INITIAL_SCORE = 0;

export const GEMS_TYPES_COUNT = 5;
export const GEMS_SEQUENCE_MIN = 3;

export const STAGE_SIZE = { height: 550, width: 600 };
export const BOARD_SIZE = { columns: 8, rows: 8 };
export const SLOT_SIZE = { height: 50, width: 50 };

export const INITIAL_SLOT_POSITION = { x: 100, y: 100 };
export const FINAL_SLOT_POSITION = {
  x: INITIAL_SLOT_POSITION.x + BOARD_SIZE.columns * SLOT_SIZE.width,
  y: INITIAL_SLOT_POSITION.y + BOARD_SIZE.rows * SLOT_SIZE.height,
};

export const EVENT_MATCH_END = "match-end";
export const EVENT_SCORE_UPDATE = "update-score";
export const EVENT_SCORE_HIGHEST = "highest-score";
export const EVENT_SOUND_ENABLED = "sound-enabled";
export const EVENT_TIMER_START = "timer-start";

export const LOCALSTORAGE_HIGHEST_SCORE = "highest-score";
export const LOCALSTORAGE_SOUND_ENABLED = "sound-enabled";

export const AUDIO_ELEMENT_ID = "pixiAudio";
