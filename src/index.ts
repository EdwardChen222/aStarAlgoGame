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

document.addEventListener('click', (event) => {
	// Convert the click position to local coordinates within the GameScene
	const point = new PIXI.Point(event.clientX, event.clientY);
	const localPoint = app.stage.toLocal(point);
	// Now you can do something with this position, like converting it to grid coordinates
	// Assuming GameScene has a method called screenToGrid or similar
	// Note: You'll need to make sure methods you want to call like this are public
	const {gridX, gridY} = sceny.screenToGrid(localPoint.x, localPoint.y);
	console.log(`Clicked on grid coordinates: ${gridX}, ${gridY}`);

	// Optionally, trigger a method within the scene based on the click
});