import { Container, Text } from "pixi.js";
import { STAGE_NAME } from "../game/constant";

export async function createMenu(state: State) {
  //the container that contains the menu
  const container = new Container();
  container.name = STAGE_NAME.menu;

  //adds the background
  //container.addChild(new Sprite(this.room.textures("pause_menu")));
  container.height = state.app.screen.height / 2;
  container.width = state.app.screen.width / 2;

  // container.pivot.x = container.width / 2;
  // container.pivot.y = container.height / 2;

  const text = createMenuButtonText("Paused!", { fontSize: 21 });
  //text.x = container.width / 2;
  //text.y = container.height * 0.1;
  container.addChild(text);

  // this.button = Object.create(null);

  // //resume button
  // this.button.resume = new GMPixi.extra.MenuButton({
  //   room: this.room,
  //   text: "Resume",
  // });
  // this.button.resume.position.set(
  //   container.width / 2,
  //   container.height * 0.375
  // );

  // /**
  //  * Events for button resume
  //  */
  // this.button.resume.on(
  //   "pointerup",
  //   function () {
  //     this.exit = true;
  //     this.goto = 0;
  //     this.enabled = false;
  //   }.bind(this)
  // );

  // //restart button
  // this.button.restart = new GMPixi.extra.MenuButton({
  //   room: this.room,
  //   text: "Restart",
  // });
  // this.button.restart.position.set(container.width / 2, container.height * 0.6);

  // /**
  //  * What to do when clicked
  //  */
  // this.button.restart.on(
  //   "pointerup",
  //   function () {
  //     this.exit = true;
  //     this.goto = 1;
  //     this.enabled = false;
  //   }.bind(this)
  // );

  // //exit button
  // this.button.exit = new GMPixi.extra.MenuButton({
  //   room: this.room,
  //   text: "Exit",
  // });
  // this.button.exit.position.set(container.width / 2, container.height * 0.825);

  // /**
  //  * What to do when clicked
  //  */
  // this.button.exit.on(
  //   "pointerup",
  //   function () {
  //     this.exit = true;
  //     this.goto = -1;
  //     this.enabled = false;
  //   }.bind(this)
  // );

  // /**
  //  * There is an error when adding child to container separately
  //  * so add them all at once
  //  */
  // container.addChild(this.button.resume, this.button.restart, this.button.exit);

  // this.addChild(container);

  // container.position.set(this.room.width / 2, this.room.height / 2);
  return container;
}

export function createMenuButtonText(
  label: string,
  {
    anchor,
    fontSize,
  }: {
    anchor?: number[];
    fontSize: number;
  }
) {
  const text = new Text(label, {
    fill: 0xffffff,
    fontFamily: "Century Gothic",
    fontSize,
    fontWeight: "bold",
  });
  if (anchor?.length) {
    if (anchor.length > 1) {
      text.anchor.set(anchor[0], anchor[1]);
    } else {
      text.anchor.set(anchor[0], anchor[0]);
    }
  }
  return text;
}
