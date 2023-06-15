import { Sprite } from "pixi.js";

export function createButton(
  textureDown: string,
  textureUp: string,
  state: IState
) {
  const button = new Sprite(state.spritesheet.textures[textureUp]);
  button.anchor.set(0.5, 0);
  button.cursor = "pointer";
  button.interactive = true;

  button.on("pointerdown", () => {
    button.texture = state.spritesheet.textures[textureDown];
  });

  button.on("pointerupoutside", async () => {
    button.texture = state.spritesheet.textures[textureUp];
  });
  return button;
}
