import * as PIXI from 'pixi.js';
import { GameScene } from './components/GameScene';

const app = new PIXI.Application({
	view: document.getElementById("pixi-canvas") as HTMLCanvasElement,
	resolution: window.devicePixelRatio || 1,
	autoDensity: true,
	backgroundColor: 0x000000,
	width: window.innerWidth,
	height: window.innerHeight
});

const sceny: GameScene = new GameScene(app);
app.stage.addChild(sceny);

