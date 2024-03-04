export class aNode {
    x: number;
    y: number;
    gCost: number = Infinity; // Cost from start to this node
    hCost: number = 0; // Heuristic cost from this node to the end
    parent: aNode | null = null;
    isObstacle: boolean = false; // Indicates if the node is an obstacle
    order: number = -1;

    constructor(x: number, y: number, isObstacle: boolean = false) {
        this.x = x;
        this.y = y;
        this.isObstacle = isObstacle;
    }
    
    get fCost(): number{
        return this.gCost + this.hCost;
    }
}

export class AStarPathfinder {
    private openList: aNode[];
    private closedList: boolean[][];
    private grid: aNode[][];
    private explorationOrder: number = 0; // Keeps track of the exploration order

    constructor(grid: aNode[][]) {
        this.openList = [];
        this.closedList = [];
        this.grid = grid;
        this.initializeClosedList();
    }

    private initializeClosedList(): void {
        // Initialize the closed list based on the grid size,
        // setting all values to false (meaning not yet processed).
        this.closedList = this.grid.map(() => new Array(this.grid[0].length).fill(false));
    }

    //calculates distance from current to goal node
    private heuristic(node: aNode, goal: aNode): number {
        // Implement your heuristic function here (Manhattan)
        return Math.abs(node.x - goal.x) + Math.abs(node.y - goal.y);
    }

    private getLowestFCostNode(): aNode | null {
        // Find and return the open list node with the lowest fCost.
        // If there is a tie, you may also consider the hCost.
        if (this.openList.length === 0) {
            return null;
        }
        let lowestFCostNode = this.openList[0];
        for (const node of this.openList) {
            if (node.fCost < lowestFCostNode.fCost || (node.fCost === lowestFCostNode.fCost && node.hCost < lowestFCostNode.hCost)) {
                lowestFCostNode = node;
            }
        }
        return lowestFCostNode;
    }

    public clearGrid(): void {
        for (let x = 0; x < this.grid.length; x++) {
            for (let y = 0; y < this.grid[x].length; y++) {
                this.grid[x][y].gCost = Infinity;
                this.grid[x][y].hCost = 0;
                this.grid[x][y].hCost = 0;
                this.grid[x][y].parent = null;
                this.grid[x][y].order = -1;
                // node.isObstacle remains unchanged
            }
        }
        // Also reset the openList, closedList, and explorationOrder
        this.openList = [];
        this.closedList = this.grid.map(() => new Array(this.grid[0].length).fill(false));
        this.explorationOrder = 0;
    }
    
    public getNeighbors(node: aNode): aNode[] {
        // Return the traversable neighbors of the given node.
        const neighbors: aNode[] = [];
        const directions = [
            { x: 0, y: -1 }, // up
            { x: 1, y: 0 },  // right
            { x: 0, y: 1 },  // down
            { x: -1, y: 0 }  // left
        ];

        for (const dir of directions) {
            const newX = node.x + dir.x;
            const newY = node.y + dir.y;
            if (newX >= 0 && newX < this.grid.length && newY >= 0 && newY < this.grid[0].length) {
                const potentialNeighbor = this.grid[newX][newY];
                if(!potentialNeighbor.isObstacle)
                neighbors.push(potentialNeighbor);
            }
        }

        return neighbors;
    }

    private distance(nodeA: aNode, nodeB: aNode): number {
        // Calculate and return the manhattan distance between nodeA and nodeB.
        const dx = Math.abs(nodeA.x - nodeB.x);
        const dy = Math.abs(nodeA.y - nodeB.y);
        return dx + dy; // Manhattan distance for 4-directional movement
    }

    private reconstructPath(endNode: aNode): aNode[] {
        // Work backwards from the end node to reconstruct the path to the start node.
        const path: aNode[] = [];
        let currentNode = endNode;
        while (currentNode != null) {
            path.unshift(currentNode); // Add the node to the beginning of the path
            currentNode = currentNode.parent!;
        }
        return path;
    }

    public findPath(startX: number, startY: number, goalX: number, goalY: number): aNode[] | null {
        // A* Algorithm implementation based on the given start and goal coordinates.
        // This function should return the path as an array of aNode objects or null if no path is found.
        this.openList.push(this.grid[startX][startY]); // Add the start node to the open list
        this.grid[startX][startY].gCost = 0; // The cost of going from start to start is zero
        this.grid[startX][startY].hCost = this.heuristic(this.grid[startX][startY], this.grid[goalX][goalY]);
        this.explorationOrder = 0;
        // this.grid[startX][startY].calculateFCost();

        while (this.openList.length > 0) {
            const currentNode = this.getLowestFCostNode();
            if (!currentNode) {
                return null; // Path not found
            }
            currentNode.order = ++this.explorationOrder;
            // Check if we've reached the goal
            if (currentNode.x === goalX && currentNode.y === goalY) {
                return this.reconstructPath(currentNode); // Reconstruct and return the path
            }

            // Move the current node from the open list to the closed list
            this.openList.splice(this.openList.indexOf(currentNode), 1);
            this.closedList[currentNode.x][currentNode.y] = true;

            // Explore neighbors
            const neighbors = this.getNeighbors(currentNode);
            for (const neighbor of neighbors) {
                if (this.closedList[neighbor.x][neighbor.y]) continue; // Skip if the neighbor is in the closed list

                const tentativeGCost = currentNode.gCost + this.distance(currentNode, neighbor);
                if (tentativeGCost < neighbor.gCost) { // Found a better path
                    neighbor.parent = currentNode;
                    neighbor.gCost = tentativeGCost;
                    neighbor.hCost = this.heuristic(neighbor, this.grid[goalX][goalY]);
                    // neighbor.calculateFCost();
                    if (!this.openList.includes(neighbor)) {
                        this.openList.push(neighbor);
                    }
                }
            }
        }

        return null; // No path found
    }

    
}

function printGrid(grid: aNode[][], start: aNode, goal: aNode, path: aNode[] | null): void {
    let gridString = "";

    for (let y = 0; y < grid[0].length; y++) { // Assuming grid is rectangular
        for (let x = 0; x < grid.length; x++) {
            const node = grid[x][y];
            if (node.x === start.x && node.y === start.y) {
                gridString += 'S ';
            } else if (node.x === goal.x && node.y === goal.y) {
                gridString += 'G ';
            } else if (node.isObstacle) {
                gridString += 'O ';
            } else if (path && path.some(pNode => pNode.x === node.x && pNode.y === node.y)) {
                gridString += '. ';
            } else {
                gridString += '_ ';
            }
        }
        gridString += '\n'; // New line at the end of each row
    }

    console.log(gridString);
}

function printGridOrder(grid: aNode[][]): void {
    let gridString = "";

    for (let y = 0; y < grid[0].length; y++) {
        for (let x = 0; x < grid.length; x++) {
            const node = grid[x][y];
            if (node.order > 0) {
                gridString += `${node.order.toString().padStart(3, ' ')} `; // Pad the order for alignment
            } else if (node.isObstacle) {
                gridString += ' O  ';
            } else {
                gridString += ' _  ';
            }
        }
        gridString += '\n';
    }

    console.log(gridString);
}


function printCosts(grid: aNode[][]): void {
    console.log("Grid Costs:");
    console.log("Format: (G,H,F)\n");

    for (let y = 0; y < grid[0].length; y++) { // Assuming grid is rectangular
        let rowString = "";
        for (let x = 0; x < grid.length; x++) {
            const node = grid[x][y];
            // Formatting the costs for display
            const gCost = isFinite(node.gCost) ? node.gCost.toString() : "Inf";
            const hCost = node.hCost.toString();
            const fCost = isFinite(node.fCost) ? node.fCost.toString() : "Inf";
            rowString += `(${gCost},${hCost}, ${fCost})\t`;
        }
        console.log(rowString);
        console.log("\n"); // New line for better separation between rows
    }
}


function runTestCases(flag: boolean) {
    if(flag){
        return;
    }
    const grid = crossWordMaze();
    const pathfinder = new AStarPathfinder(grid);

    // Test 1: Path from (0, 0) to (9, 9)
    console.log("Test 1: Path from (0, 0) to (9, 9)");
    let path = pathfinder.findPath(0, 0, 14, 14);
    if (path) {
        console.log("Path found:", path.map(node => `(${node.x}, ${node.y})`).join(" -> "));
    } else {
        console.log("No path found.");
    }
    printGrid(grid, grid[0][0], grid[9][9], path);
    printGridOrder(grid);
    printCosts(grid);

    // Test 2: Path from (0, 0) to (2, 5) - Directly into the barrier, expecting path around it
    console.log("Test 2: Path from (0, 0) to (0, 5)");
    pathfinder.clearGrid();
    let path1 = pathfinder.findPath(0, 0, 0, 5);
    if (path1) {
        console.log("Path found:", path1.map(node => `(${node.x}, ${node.y})`).join(" -> "));
    } else {
        console.log("No path found.");
    }
    printGrid(grid, grid[0][0], grid[0][5], path1);
    printGridOrder(grid);
    printCosts(grid);


    // Test 3: Path from (0, 0) to an enclosed location (1, 6), expecting no path
    console.log("Test 3: Path from (0, 0) to (1, 7) - Enclosed by obstacles");
    pathfinder.clearGrid();
    let path2 = pathfinder.findPath(0, 0, 1, 7);
    if (path2) {
        console.log("Path found:", path2.map(node => `(${node.x}, ${node.y})`).join(" -> "));
    } else {
        console.log("No path found.");
    }
    printGrid(grid, grid[0][0], grid[1][7], path2);
    printGridOrder(grid);
    printCosts(grid);
}


const gridRows = 15; // Number of rows in the grid
const gridCols = 15; // Number of columns in the grid

// Initialize the grid with aNode instances
// const grid: aNode[][] = Array.from({ length: gridRows }, (_, x) =>
//     Array.from({ length: gridCols }, (_, y) => new aNode(x, y))
// );

//Function to mark a grid position as an obstacle
function addObstacle(grid: aNode[][],x: number, y: number): void {
    if (x >= 0 && x < gridRows && y >= 0 && y < gridCols) {
        grid[x][y].isObstacle = true;
    }
}
//initialize the crossword puzzle maze
function crossWordMaze(){
    const grid: aNode[][] = Array.from({ length: 15 }, (_, x) =>
    Array.from({ length: 15 }, (_, y) => new aNode(x, y)));
    addObstacle(grid,4,0);
    addObstacle(grid,4,1);
    addObstacle(grid,10,0);
    addObstacle(grid,10,1);
    addObstacle(grid,3,3);
    addObstacle(grid,7,3);
    addObstacle(grid,11,3);
    addObstacle(grid,0,4);
    addObstacle(grid,1,4);
    addObstacle(grid,6,4);
    addObstacle(grid,13,4);
    addObstacle(grid,14,4);
    addObstacle(grid,5,5);
    addObstacle(grid,4,6);
    addObstacle(grid,3,7);
    addObstacle(grid,11,7);
    addObstacle(grid,10,8);
    addObstacle(grid,9,9);
    addObstacle(grid,0,10);
    addObstacle(grid,1,10);
    addObstacle(grid,8,10);
    addObstacle(grid,13,10);
    addObstacle(grid,14,10);
    addObstacle(grid,3,11);
    addObstacle(grid,7,11);
    addObstacle(grid,11,11);
    addObstacle(grid,4,13);
    addObstacle(grid,10,13);
    addObstacle(grid,4,14);
    addObstacle(grid,10,14);
    addObstacle(grid,4,2);
    return grid;
}

runTestCases(true);
