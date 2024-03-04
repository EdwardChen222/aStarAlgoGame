import * as PIXI from 'pixi.js';
import { aNode, AStarPathfinder } from './AstarAlgo';

export class GameScene extends PIXI.Container {
    private readonly cellSize: number = 40; // Size of each cell
    private readonly gap: number = 4; // Gap size between cells
    private readonly spriteSize: number = this.cellSize - this.gap;
    private grid: aNode[][];
    private board: PIXI.Container;
    private app: PIXI.Application;
    private dogTexture = PIXI.Texture.from("dog.jpeg");
    private boneTexture = PIXI.Texture.from("bone.jpeg");
    private obstacleTexture = PIXI.Texture.from("wood-log.jpeg");
    private dogSprite: PIXI.Sprite = new PIXI.Sprite(this.dogTexture);
    private boneSprite: PIXI.Sprite = new PIXI.Sprite(this.boneTexture);
    //private obstacleSprites = [];
    //private obstacleSprite: PIXI.Sprite = new PIXI.Sprite(this.obstacleTexture);
    private optimizedPath: aNode[] | null = null;
    private pathVisuals: PIXI.Graphics[] = [];
    private pathVisible = false;

    constructor(app: PIXI.Application) {
        super();
        this.app = app;
        this.board = new PIXI.Container();
        this.grid = this.crossWordMaze();
        this.board.x = (this.app.screen.width - ((this.grid.length * this.cellSize) + ((this.grid.length - 1) * this.gap))) / 2; // Adjust for gaps
        this.board.y = (this.app.screen.height - ((this.grid[0].length * this.cellSize) + ((this.grid[0].length - 1) * this.gap))) / 2; // Adjust for gaps
        this.addChild(this.board);
        this.createToggleButton();
        this.initializeGame();
    }  
    

    private initializeGame(): void {
        this.setupBoard();
        this.setupSprites();
        this.updatePath();
    }

    private crossWordMaze(): aNode[][]{
        const grid: aNode[][] = Array.from({ length: 15 }, (_, x) =>
        Array.from({ length: 15 }, (_, y) => new aNode(x, y)));
        this.addObstacle(grid,4,0);
        this.addObstacle(grid,4,1);
        this.addObstacle(grid,10,0);
        this.addObstacle(grid,10,1);
        this.addObstacle(grid,3,3);
        this.addObstacle(grid,7,3);
        this.addObstacle(grid,11,3);
        this.addObstacle(grid,0,4);
        this.addObstacle(grid,1,4);
        this.addObstacle(grid,6,4);
        this.addObstacle(grid,13,4);
        this.addObstacle(grid,14,4);
        this.addObstacle(grid,5,5);
        this.addObstacle(grid,4,6);
        this.addObstacle(grid,3,7);
        this.addObstacle(grid,11,7);
        this.addObstacle(grid,10,8);
        this.addObstacle(grid,9,9);
        this.addObstacle(grid,0,10);
        this.addObstacle(grid,1,10);
        this.addObstacle(grid,8,10);
        this.addObstacle(grid,13,10);
        this.addObstacle(grid,14,10);
        this.addObstacle(grid,3,11);
        this.addObstacle(grid,7,11);
        this.addObstacle(grid,11,11);
        this.addObstacle(grid,4,13);
        this.addObstacle(grid,10,13);
        this.addObstacle(grid,4,14);
        this.addObstacle(grid,10,14);
        this.addObstacle(grid,4,2);
        return grid;
    }

    private addObstacle(grid: aNode[][],x: number, y: number): void {
        if (x >= 0 && x < grid.length && y >= 0 && y < grid[0].length) {
            grid[x][y].isObstacle = true;
        }
    }

    public screenToGrid(screenX: number, screenY: number): { gridX: number, gridY: number } {
        // First, adjust the screenX and screenY coordinates relative to the board's position
        const relativeX = screenX - this.board.x;
        const relativeY = screenY - this.board.y;
    
        // Next, calculate the grid coordinates. Since cells include gaps, add the gap to the cellSize
        // for calculation. Use Math.floor to round down to the nearest whole number.
        const gridX = Math.floor(relativeX / (this.cellSize + this.gap));
        const gridY = Math.floor(relativeY / (this.cellSize + this.gap));
    
        return { gridX, gridY };
    }
    
    private setupBoard(): void {
        const texture = PIXI.Texture.from('grid.png');
        for (let row = 0; row < this.grid.length; row++) {
            for (let col = 0; col < this.grid[0].length; col++) {
                const grid = new PIXI.Sprite(texture);
                grid.width = this.cellSize;
                grid.height = this.cellSize;
                grid.x = col * (this.cellSize + this.gap); // Include gap in position calculation
                grid.y = row * (this.cellSize + this.gap); // Include gap in position calculation
                this.board.addChild(grid);
            }
        }
    }

    private setupSprites(): void {
        this.dogSprite.width = this.dogSprite.height = this.boneSprite.width = this.boneSprite.height = this.spriteSize;
        this.dogSprite.anchor.set(0.5);
        this.boneSprite.anchor.set(0.5);

        // Position sprites
        this.dogSprite.position.set(this.cellSize / 2, this.cellSize / 2);
        this.boneSprite.position.set((this.grid.length - 1) * (this.cellSize+ this.gap) + this.cellSize / 2, (this.grid[0].length - 1) * (this.cellSize + this.gap) + this.cellSize / 2);

        this.board.addChild(this.dogSprite);
        this.board.addChild(this.boneSprite);
        for (let row = 0; row < this.grid.length; row++) {
            for (let col = 0; col < this.grid[0].length; col++) {
                if (this.grid[row][col].isObstacle){
                    const obstacleSprite = new PIXI.Sprite(this.obstacleTexture);
                    obstacleSprite.width = obstacleSprite.height = this.spriteSize;
                    obstacleSprite.anchor.set(0.5, 0.5);
                    obstacleSprite.position.set(row * (this.cellSize+ this.gap) + this.cellSize / 2, col * (this.cellSize + this.gap) + this.cellSize / 2);
                    this.board.addChild(obstacleSprite);
                }
            }
        }
    }

    private updatePath(): void {
        const pathfinder = new AStarPathfinder(this.grid);

        this.optimizedPath = pathfinder.findPath(0, 0, this.grid.length - 1, this.grid[0].length - 1);
        //this.renderPath();
    }

    // private createGridFromGameState(x: number, y: number): aNode[][] {
    //     // Simplify for this example: No dynamic obstacles
    //     return Array.from({ length: x }, (_, x) => Array.from({ length: y }, (_, y) => new aNode(x, y)));
    // }

    private renderPath(): void {
        this.clearPath();
        this.pathVisuals.forEach(visual => visual.destroy());
        this.pathVisuals = [];

        if (this.optimizedPath) {
            this.optimizedPath.forEach(node => {
                const marker = new PIXI.Graphics();
                marker.beginFill(0xff0000).drawCircle(node.x * (this.cellSize + this.gap) + this.cellSize / 2, node.y * (this.cellSize + this.gap) + this.cellSize / 2, 5).endFill();
                this.board.addChild(marker);
                this.pathVisuals.push(marker);
            });
        }
    }
    togglePathVisibility(): void {
        this.pathVisible = !this.pathVisible; // Toggle the visibility state
        if (this.pathVisible) {
            // If the path should be visible, render it
            this.renderPath();
        } else {
            // If the path should not be visible, clear it
            this.clearPath();
        }
    }

    private clearPath(): void {
        // Remove or reset the visuals for the path from the screen
        this.pathVisuals.forEach(visual => {
            this.app.stage.removeChild(visual); // Remove the visual from the stage
            visual.destroy(); // Optional: If you won't reuse it, destroy it
        });
        this.pathVisuals = []; // Clear the array for the next path visualization
    }

    createToggleButton(): void {
        // Button background
        const button = new PIXI.Graphics()
            .beginFill(0x0a8a0a) // Button color
            .drawRoundedRect(0, 0, 150, 40, 10) // x, y, width, height, radius
            .endFill();
        button.x = this.app.screen.width - 160; // Position the button
        button.y = 10;
        button.interactive = true; // Make the graphics object interactive
        button.cursor = 'pointer'; // Change the cursor on hover

        // Button text
        const buttonText = new PIXI.Text('Toggle Path', {
            fontFamily: 'Arial',
            fontSize: 14,
            fill: 0xffffff,
        });
        buttonText.x = button.width / 2 - buttonText.width / 2;
        buttonText.y = button.height / 2 - buttonText.height / 2;

        button.addChild(buttonText);

        // Click event
        button.on('pointerdown', () => {
            this.togglePathVisibility();
        });

        this.app.stage.addChild(button);
    }
}
