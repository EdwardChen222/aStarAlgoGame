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


// In index.ts
document.addEventListener('click', (event) => {
    const point = new PIXI.Point(event.clientX, event.clientY);
    const localPoint = app.stage.toLocal(point);

    const {gridX, gridY} = sceny.screenToGrid(localPoint.x, localPoint.y);

    // Check if the clicked position is the dog's current position
    //const dogPos = sceny.getDogPosition();
    //const dogGridPos = sceny.screenToGridSprites(dogPos.x, dogPos.y);
	// console.log("mouse position:", gridX, gridY);
	// console.log("dog position1:", dogPos.x, dogPos.y);
	// console.log("dog position:", dogGridPos.gridX, dogGridPos.gridY);
    // If clicked on the dog, highlight possible moves
    const possibleMoves = sceny.getPossibleMoves();
	console.log("possible moves", possibleMoves);
    // Now highlight these moves. This part would need sceny to have a method to highlight nodes
    sceny.highlightNodes(possibleMoves); // You'll need to implement this method in GameScene
    // Check if clicked position is within possible moves
	const isPossibleMove = possibleMoves.some(node => node.x === gridX && node.y === gridY);
	if (isPossibleMove) {
		// If a possible move is clicked, move the dog
		console.log("possible move");
		sceny.moveDog(gridX, gridY);
		const possibleMoves = sceny.getPossibleMoves();
		console.log("possible moves", possibleMoves);
		sceny.highlightNodes(possibleMoves);
	}
});

// document.addEventListener('click', (event) => {
// 	// Convert the click position to local coordinates within the GameScene
// 	const point = new PIXI.Point(event.clientX, event.clientY);
// 	const localPoint = app.stage.toLocal(point);
// 	// Now you can do something with this position, like converting it to grid coordinates
// 	// Assuming GameScene has a method called screenToGrid or similar
// 	// Note: You'll need to make sure methods you want to call like this are public
// 	const {gridX, gridY} = sceny.screenToGrid(localPoint.x, localPoint.y);
// 	console.log(`Clicked on grid coordinates: ${gridX}, ${gridY}`);

// 	// Optionally, trigger a method within the scene based on the click
// });