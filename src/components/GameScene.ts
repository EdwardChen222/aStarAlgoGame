import * as PIXI from 'pixi.js';
import { aNode, AStarPathfinder } from './AstarAlgo';

export class GameScene extends PIXI.Container {
    private readonly cellSize: number = 40; // Size of each cell
    private readonly gap: number = 4; // Gap size between cells
    private board: PIXI.Container;
    private app: PIXI.Application;
    private dogTexture = PIXI.Texture.from("dog.jpeg");
    private boneTexture = PIXI.Texture.from("bone.jpeg");
    private dogSprite: PIXI.Sprite = new PIXI.Sprite(this.dogTexture);
    private boneSprite: PIXI.Sprite = new PIXI.Sprite(this.boneTexture);
    private optimizedPath: aNode[] | null = null;
    private pathVisuals: PIXI.Graphics[] = [];

    constructor(app: PIXI.Application) {
        super();
        this.app = app;
        this.board = new PIXI.Container();
        this.board.x = (this.app.screen.width - ((10 * this.cellSize) + (9 * this.gap))) / 2; // Adjust for gaps
        this.board.y = (this.app.screen.height - ((10 * this.cellSize) + (9 * this.gap))) / 2; // Adjust for gaps
        this.addChild(this.board);

        this.initializeGame();
    }

    private initializeGame(): void {
        this.setupBoard();
        this.setupSprites();
        this.updatePath();
    }

    private setupBoard(): void {
        const texture = PIXI.Texture.from('grid.png');
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 10; col++) {
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
        this.dogSprite.width = this.dogSprite.height = this.boneSprite.width = this.boneSprite.height = this.cellSize - this.gap;
        this.dogSprite.anchor.set(0.5);
        this.boneSprite.anchor.set(0.5);

        // Position sprites
        this.dogSprite.position.set(this.cellSize / 2, this.cellSize / 2);
        this.boneSprite.position.set(9 * (this.cellSize+ this.gap) + this.cellSize / 2, 9 * (this.cellSize + this.gap) + this.cellSize / 2);

        this.board.addChild(this.dogSprite);
        this.board.addChild(this.boneSprite);
    }

    private updatePath(): void {
        const pathfinder = new AStarPathfinder(this.createGridFromGameState(15, 15));

        this.optimizedPath = pathfinder.findPath(0, 0, 9, 9);
        this.renderPath();
    }

    private createGridFromGameState(x: number, y: number): aNode[][] {
        // Simplify for this example: No dynamic obstacles
        return Array.from({ length: x }, (_, x) => Array.from({ length: y }, (_, y) => new aNode(x, y)));
    }

    private renderPath(): void {
        this.pathVisuals.forEach(visual => visual.destroy());
        this.pathVisuals = [];

        if (this.optimizedPath) {
            this.optimizedPath.forEach(node => {
                const marker = new PIXI.Graphics();
                marker.beginFill(0xff0000).drawCircle(node.x * this.cellSize + this.cellSize / 2, node.y * this.cellSize + this.cellSize / 2, 5).endFill();
                this.board.addChild(marker);
                this.pathVisuals.push(marker);
            });
        }
    }
}
