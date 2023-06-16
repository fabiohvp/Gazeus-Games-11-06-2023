type IPromiseResolve = (value: void | PromiseLike<void>) => void;

interface IAudioManager {
  playing: boolean;
  load(sounds: string[]): Promise<void>;
  loop(): void;
  mute(muted: boolean): void;
  play(sound: string, priority?: boolean): void;
  stop(): void;
}

interface ISlot {
  slotX: number;
  slotY: number;
}

interface IGemSlot extends ISlot {
  type: number;
  gem: import("pixi.js").Sprite;
}

interface IState {
  //app: import("pixi.js").Application<import("pixi.js").ICanvas>;
  currentStage: import("pixi.js").Container | null;
  score: number;
  scoring: boolean;
  slots: IGemSlot[][];
  soundEnabled: boolean;
  spritesheet: import("pixi.js").Spritesheet;
  swapEnabled: boolean;
}
