import { readFile } from "fs/promises";
import { Texture } from "pixi.js";

export function noop() {}

export class CustomSpritesheet {
  textures: { [key: string]: Texture } = {};

  async load(fileName: string) {
    const file = await readFile(`${__dirname}/${fileName}`, "utf8");
    const data = JSON.parse(file);

    for (const textureName of Object.keys(data.frames)) {
      const textureData = data.frames[textureName];
      textureData.off = noop;
      textureData.on = noop;
      textureData.once = noop;
      const texture = new Texture(textureData);
      this.textures[textureName] = texture;
    }
  }
}
