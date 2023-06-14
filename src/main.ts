import { Application, Assets } from "pixi.js";
import { changeStage, createState } from "./game/state";
import { createWelcome } from "./stage/welcome";

async function createApp() {
  // Create the application helper and add its render target to the page
  const app = new Application({
    height: 550,
    width: 600,
  });
  document.body.appendChild(app.view as any as Node);

  const spritesheet = await Assets.load("sprite/matchup.json");
  const state = createState(app, spritesheet);

  const welcome = await createWelcome(state);
  changeStage(welcome, state);
}

createApp();
