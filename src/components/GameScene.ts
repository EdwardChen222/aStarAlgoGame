import * as PIXI from 'pixi.js';
import {aNode, AStarPathfinder} from './AstarAlgo';

export class GameScene extends PIXI.Container {
    private readonly cellSize: number = 40; // Size of each cell
    private board: PIXI.Container;
    private app: PIXI.Application;
    private gameState: {
        dogPosition: { x: number, y: number },
        bonePosition: { x: number, y: number },
        obstacles: Array<{ x: number, y: number }>,
        playerTurn: boolean,
        gameStatus: 'ongoing' | 'won' | 'lost'
    };
    private dogTexture = PIXI.Texture.from("dog.jpeg");
    private boneTexture = PIXI.Texture.from("bone.jpeg");
    private obstacleTexture = PIXI.Texture.from("wood-log.jpeg");
    private dogSprite: PIXI.Sprite = new PIXI.Sprite(this.dogTexture);
    private boneSprite: PIXI.Sprite = new PIXI.Sprite(this.boneTexture);
    private obstacleSprites: PIXI.Sprite[] = [];
    private gap: number = 4;
    private optimizedPath: aNode[] | null = null;
    private pathVisible = false; // Track the visibility state of the path
    private pathVisuals: PIXI.DisplayObject[] = [];
    private ghostObstacleSprite: PIXI.Sprite | null = null;
    private isPlacingObstacle = false;


    constructor(app: PIXI.Application) {
        super(); // Mandatory! This calls the superclass constructor.
        this.gameState = {
            dogPosition: { x: 0, y: 0 }, // Starting position for the dog
            bonePosition: { x: 9, y: 9 }, // Position for the bone
            obstacles: [{x: 10, y: 1}, {x: 10, y: 2}], // Initially, no obstacles
            playerTurn: true, // Player starts the game
            gameStatus: 'ongoing' // Game is ongoing
        };
        this.app = app;
        this.board = new PIXI.Container();
        this.board.x = (this.app.screen.width - (10 * this.cellSize)) / 2;
        this.board.y = (this.app.screen.height - (10 * this.cellSize)) / 2;
        this.createToggleButton();
        const texture = PIXI.Texture.from('grid.png');
        for (let row = 0; row < 10; row++) { // Loop for rows
            for (let col = 0; col < 10; col++) { // Loop for columns
                const grid = new PIXI.Sprite(texture);
                grid.width = this.cellSize;
                grid.height = this.cellSize;
                grid.anchor.set(0.5, 0.5);
                grid.x = col * (this.cellSize + this.gap) + this.cellSize / 2;
                grid.y = row * (this.cellSize + this.gap) + this.cellSize / 2;
        
                this.board.addChild(grid);
            }
        }
        this.board.addChild(this.dogSprite, this.boneSprite);
        this.addChild(this.board);
        // Text style and text
        const styly: PIXI.TextStyle = new PIXI.TextStyle({
            align: "center",
            fill: "#754c24",
            fontSize: 42
        });

        const texty: PIXI.Text = new PIXI.Text('CS397 demo', styly); // Text supports unicode!
        texty.x = (this.app.screen.width - texty.width) / 2; // Center the text
        texty.y = this.board.y - texty.height - 10; // Position the text at the top
        this.addChild(texty); // Add to the Scene container, not the global app.stage
        this.setupInteraction();
        this.adjustSpriteSizes();
        this.initializeObstacles();
        this.updatePath();
        this.renderGameState();
        this.setupPointerMove();
    }
    private setupPointerMove(): void {
        this.app.stage.on('pointermove', (event) => {
            if (this.ghostObstacleSprite) {
                const newPosition = event.data.getLocalPosition(this.app.stage);
                this.ghostObstacleSprite.position.set(newPosition.x, newPosition.y);
            }
        });
    }
    private initializeObstacles(): void {
        this.gameState.obstacles.forEach(obstacle => {
            const sprite = new PIXI.Sprite(this.obstacleTexture);
            sprite.width = this.cellSize - (this.gap * 2); // Adjust width for each sprite
            sprite.height = this.cellSize - (this.gap * 2); // Adjust height for each sprite
            sprite.anchor.set(0.5, 0.5); // Adjust anchor for each sprite
            sprite.x = obstacle.x * (this.cellSize + this.gap) + this.cellSize / 2; // Set X position
            sprite.y = obstacle.y * (this.cellSize + this.gap) + this.cellSize / 2; // Set Y position
            sprite.interactive = true;
            sprite.on('pointerdown', () => {
                this.onObstacleClick(sprite);
            });
            this.obstacleSprites.push(sprite); // Add to the array of obstacle sprites
            this.board.addChild(sprite); // Add sprite to the PIXI.Container
        });
    }
    private onObstacleClick(sprite: PIXI.Sprite): void {
    // Implement logic to handle obstacle click
        if (this.isPlacingObstacle) {
            // If we are already placing an obstacle, don't do anything
            return;
        }
    // Clone the sprite to create a "ghost" version of it
        this.isPlacingObstacle = true;

        // Create a ghost sprite if it doesn't exist
        if (!this.ghostObstacleSprite) {
            this.ghostObstacleSprite = new PIXI.Sprite(this.obstacleTexture);
            this.ghostObstacleSprite.alpha = 0.5;
            this.ghostObstacleSprite.width = sprite.width;
            this.ghostObstacleSprite.height = sprite.height;
            this.ghostObstacleSprite.anchor.set(0.5);
            this.app.stage.addChild(this.ghostObstacleSprite);
        }

        // Make the ghost sprite visible
        this.ghostObstacleSprite.visible = true;
    }
    private updatePath(): void {
        // Initialize your A* pathfinder with the current grid setup
        const pathfinder = new AStarPathfinder(this.createGridFromGameState());
    
        // Find the path from the dog's position to the bone's position
        this.optimizedPath = pathfinder.findPath(
            this.gameState.dogPosition.x, 
            this.gameState.dogPosition.y, 
            this.gameState.bonePosition.x, 
            this.gameState.bonePosition.y
        );
    
        // Optionally, render the path on the grid
        this.renderPath();
    }

    private createGridFromGameState(): aNode[][] {
        const grid: aNode[][] = Array.from({ length: 10 }, (_, x) =>
            Array.from({ length: 10 }, (_, y) => new aNode(x, y, false))
        );
    
        // Mark obstacles in the grid
        this.gameState.obstacles.forEach(obstacle => {
            if (obstacle.x >= 0 && obstacle.x < 10 && obstacle.y >= 0 && obstacle.y < 10) {
                grid[obstacle.x][obstacle.y].isObstacle = true;
            }
        });
    
        return grid;
    }

    private renderPath(): void {
        // Assuming this method is already implemented to visualize the path
        // Make sure to populate the pathVisuals array with any sprites or graphics used to visualize the path
        // Example:
        // const pathMarker = new PIXI.Graphics();
        // // Visualization code here...
        // this.pathVisuals.push(pathMarker);
        // this.app.stage.addChild(pathMarker);
    
        // Clear existing path visuals before rendering new ones
        this.clearPath();
    
        if (this.optimizedPath) {
            this.optimizedPath.forEach(node => {
                const marker = new PIXI.Graphics();
                marker.beginFill(0xff0000).drawCircle(0, 0, 10).endFill(); // Example marker
                const position = this.gridToScreen(node.x, node.y);
                marker.x = position.x;
                marker.y = position.y;
                this.app.stage.addChild(marker);
                this.pathVisuals.push(marker);
            });
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
    

    private adjustSpriteSizes() {
        // Calculate the desired size for the sprites (cellSize - padding)
        const spriteSize = this.cellSize - (this.gap * 2); // Adjust gap as needed for padding

        // Adjust dogSprite size
        this.dogSprite.width = spriteSize;
        this.dogSprite.height = spriteSize;
        const dogPosition = this.gridToScreen(this.gameState.dogPosition.x, this.gameState.dogPosition.y); // Bottom left if 10x10 grid
        this.dogSprite.position.set(dogPosition.x, dogPosition.y);
        console.log("dog position:", dogPosition.x, dogPosition.y);
        this.dogSprite.anchor.set(0.5, 0.5); // Center the sprite

        // Adjust boneSprite size
        this.boneSprite.width = spriteSize;
        this.boneSprite.height = spriteSize;
        const bonePosition = this.gridToScreen(10, 1);
        this.boneSprite.position.set(bonePosition.x, bonePosition.y);
        console.log("bone position:", bonePosition.x, bonePosition.y);
        this.boneSprite.anchor.set(0.5, 0.5); // Center the sprite
        // this.obstacleSprites.position.set(this.gridToScreen(10,1).x, this.gridToScreen(10,1).y);
    }
    private setupInteraction(): void {
        (this.app.view as HTMLCanvasElement).addEventListener('click', (event) => {
            const rect = (this.app.view as HTMLCanvasElement).getBoundingClientRect();
            const scaleX = this.app.view.width / rect.width;   // Get the current scale of the canvas
            const scaleY = this.app.view.height / rect.height;
            const x = (event.clientX - rect.left) * scaleX;    // Adjust mouse position to canvas scale
            const y = (event.clientY - rect.top) * scaleY;

            this.onPlayerAction(x, y);
        });
    }

    placeObstacle(gridX: number, gridY: number) {
       // Calculate the screen coordinates from the grid coordinates
        const { x, y } = this.gridToScreen(gridX, gridY);

        // Create a new sprite for this obstacle at the correct position
        const sprite = new PIXI.Sprite(this.obstacleTexture);
        sprite.width = this.cellSize - (this.gap * 2);
        sprite.height = this.cellSize - (this.gap * 2);
        sprite.anchor.set(0.5, 0.5);
        sprite.x = x;
        sprite.y = y;
        this.board.addChild(sprite);
        this.obstacleSprites.push(sprite);

        // Add the new obstacle to the game state
        this.gameState.obstacles.push({ x: gridX, y: gridY });

        // Update the path since we've added a new obstacle
        this.updatePath();
    }


// Method to move the dog
    moveDog() {
        // If we have an optimized path and it's the dog's turn
        if (this.optimizedPath && this.optimizedPath.length > 0 && !this.gameState.playerTurn) {
            // Move the dog along the path
            const nextStep = this.optimizedPath.shift(); // Remove the first step, which is the next position

            if (nextStep) {
                // Set the new position for the dog
                this.gameState.dogPosition.x = nextStep.x;
                this.gameState.dogPosition.y = nextStep.y;
            }

            // It's now the player's turn
            this.gameState.playerTurn = true;

            // Update the path and re-render the game state
            this.updatePath();
            this.renderGameState();
        }
    }


    checkGameState() {
        // Check if the dog reached the bone
        if (this.gameState.dogPosition.x === this.gameState.bonePosition.x &&
            this.gameState.dogPosition.y === this.gameState.bonePosition.y) {
            this.gameState.gameStatus = 'won';
            console.log("check game state won");
        }
        // Additional checks for losing conditions or other game status updates
    }

    renderGameState() {   
        // First, update the dog's position
        this.dogSprite.x = this.gameState.dogPosition.x * (this.cellSize + 4) + this.cellSize / 2;
        this.dogSprite.y = this.gameState.dogPosition.y * (this.cellSize + 4) + this.cellSize / 2;
        
        // Update the bone's position
        // Assuming boneSprite was created similarly to dogSprite
        this.boneSprite.x = this.gameState.bonePosition.x * (this.cellSize + 4) + this.cellSize / 2;
        this.boneSprite.y = this.gameState.bonePosition.y * (this.cellSize + 4) + this.cellSize / 2;
    
        this.obstacleSprites[0].x = this.gameState.obstacles[0].x * (this.cellSize + 4) + this.cellSize / 2;
        this.obstacleSprites[0].y = this.gameState.obstacles[0].y * (this.cellSize + 4) + this.cellSize / 2;
        // Update obstacles
        // This example assumes you're tracking obstacle sprites in an array or similar structure
        // and that obstacles don't move once placed.
        // this.gameState.obstacles.forEach((obstacle, index) => {

        //     this.obstacleSprites[index].x = obstacle.x * (this.cellSize + 4) + this.cellSize / 2;
        //     this.obstacleSprites[index].y = obstacle.y * (this.cellSize + 4) + this.cellSize / 2;
        // });
    
        // If there are more obstacles in the sprite array than in the gameState (e.g., after a reset),
        // you might want to remove the excess sprites here.
        console.log("render game state");
    }

    //Helper function to convert grid coordinates to screen coordinates
    private gridToScreen(gridX: number, gridY: number): { x: number, y: number } {
        return {
            x: this.board.x + gridX * (this.cellSize + this.gap) + this.cellSize / 2,
            y: this.board.y + gridY * (this.cellSize + this.gap) + this.cellSize / 2,
        };
    }
    
    // Helper function to convert screen coordinates to grid coordinates
    private screenToGrid(x: number, y: number): { gridX: number, gridY: number } {
        const gridX = Math.floor((x - this.board.x) / (this.cellSize + this.gap));
        const gridY = Math.floor((y - this.board.y) / (this.cellSize + this.gap));
        return { gridX, gridY };
    }
    private isOccupied(gridX: number, gridY: number): boolean {
        // Loop through all obstacles and check if any has the same grid position
        // Check if any obstacle occupies the grid cell
        return this.gameState.obstacles.some(obstacle => obstacle.x === gridX && obstacle.y === gridY);
    }
    // Function to handle player actions (e.g., clicks)
    public onPlayerAction(screenX: number, screenY: number) {
        // Convert the click position to grid coordinates
        const { gridX, gridY } = this.screenToGrid(screenX, screenY);

        // Check if we're currently placing an obstacle
        if (this.isPlacingObstacle) {
            // Check if the clicked grid cell is unoccupied
            if (!this.isOccupied(gridX, gridY)) {
                // Place the obstacle at the clicked grid cell
                this.placeObstacle(gridX, gridY);
                
                // Move the dog one step along the optimal path
                this.moveDog();
                
                // We've finished placing the obstacle, so stop the placement process
                this.stopPlacingObstacle(); // This is where you call it
            }
        } else {
            // If we're not in placing mode, check if an obstacle was clicked
            const clickedObstacleIndex = this.gameState.obstacles.findIndex(obstacle => obstacle.x === gridX && obstacle.y === gridY);
            if (clickedObstacleIndex !== -1) {
                // Start placing a new obstacle
                this.beginPlacingObstacle();
            }
        }
    }
    private beginPlacingObstacle() {
        // Set the flag indicating that we're placing an obstacle
        this.isPlacingObstacle = true;
        
        // Create the ghost sprite if it doesn't exist
        if (!this.ghostObstacleSprite) {
            this.ghostObstacleSprite = new PIXI.Sprite(this.obstacleTexture);
            this.ghostObstacleSprite.alpha = 0.5; // Make it semi-transparent
            this.ghostObstacleSprite.width = this.cellSize - (this.gap * 2);
            this.ghostObstacleSprite.height = this.cellSize - (this.gap * 2);
            this.ghostObstacleSprite.anchor.set(0.5);
            this.app.stage.addChild(this.ghostObstacleSprite);
        }
        
        // Make the ghost sprite visible
        this.ghostObstacleSprite.visible = true;

        // Add a listener to update the ghost sprite position to follow the mouse
        this.app.stage.on('pointermove', this.handlePointerMove, this);
    }
    private handlePointerMove(event: any) {
        if (this.ghostObstacleSprite) {
            const newPosition = event.data.getLocalPosition(this.app.stage);
            this.ghostObstacleSprite.position.set(newPosition.x, newPosition.y);
        }
    }

    private stopPlacingObstacle() {
        if (this.ghostObstacleSprite) {
            this.ghostObstacleSprite.visible = false;
            this.app.stage.off('pointermove', this.handlePointerMove, this);
            this.isPlacingObstacle = false;
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

