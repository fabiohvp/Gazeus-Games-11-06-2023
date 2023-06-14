import { Text } from "pixi.js";

export function createText(label: string, fontSize: number) {
  const text = new Text(label, {
    fill: 0xffffff,
    fontFamily: "Century Gothic",
    fontSize,
    fontWeight: "bold",
  });
  return text;
}
