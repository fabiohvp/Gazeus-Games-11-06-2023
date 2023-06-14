type Callback = () => void;

interface Slot {
  slotX: number;
  slotY: number;
}

interface GemSlot extends Slot {
  type: number;
  gem: import("pixi.js").Sprite;
}

interface State {
  app: import("pixi.js").Application<import("pixi.js").ICanvas>;
  currentStage: Container | null;
  score: number;
  slots: GemSlot[][];
  spritesheet: import("pixi.js").Spritesheet;
  swaping: boolean;
}
