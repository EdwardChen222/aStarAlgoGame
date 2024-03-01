import * as PIXI from 'pixi.js';
import { GameScene } from './components/GameScene';

const app = new PIXI.Application({
	view: document.getElementById("pixi-canvas") as HTMLCanvasElement,
	resolution: window.devicePixelRatio || 1,
	autoDensity: true,
	backgroundColor: 0x000000,
	width: 640,
	height: 480
});

const sceny: GameScene = new GameScene(app);
app.stage.addChild(sceny);


// const myScene = new GameScene(app);
// app.stage.addChild(myScene);
// const cellSize = 40; // Size of each cell
// const board: PIXI.Container = new PIXI.Container();
// //center the board in the application
// board.x = (app.screen.width - (10 * cellSize)) / 2;
// board.y = (app.screen.height - (10 * cellSize)) / 2;
// app.stage.addChild(board);

// const styly: PIXI.TextStyle = new PIXI.TextStyle({
//     align: "center",
//     fill: "#754c24",
//     fontSize: 42
// });
// const texty: PIXI.Text = new PIXI.Text('CS397 demo', styly); // Text supports unicode!
// app.stage.addChild(texty);

// //create a new texture for the grid
// const texture = PIXI.Texture.from('https://www.icolorpalette.com/download/solidcolorimage/006400_solid_color_background_icolorpalette.png')
// //Create a 10x10 grid
// const gap = 4; // Gap between cells
// for (let i = 0; i < 100; i++){
// 	const grid = new PIXI.Sprite(texture);
// 	grid.width = cellSize;
// 	grid.height = cellSize;
// 	grid.anchor.set(0.5);
// 	// Position each grid cell with a gap between them
// 	grid.x = (i % 10) * (cellSize + gap) + cellSize / 2;
// 	grid.y = Math.floor(i / 10) * (cellSize + gap) + cellSize / 2;
// 	board.addChild(grid);
// }

//filter demo
// const myBlurFilter = new PIXI.BlurFilter();
// board.filters = [myBlurFilter];

// const clampy: Sprite = Sprite.from("clampy.png");

// clampy.anchor.set(0.5);

// clampy.x = app.screen.width / 2;
// clampy.y = app.screen.height / 2;

// conty.addChild(clampy);