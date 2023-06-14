import { Sprite } from "pixi.js";

export function createButton(texture: string, state: State) {
  const button = new Sprite(state.spritesheet.textures[texture]);
  button.anchor.set(0.5, 0);
  button.cursor = "pointer";
  button.interactive = true;
  return button;
}
