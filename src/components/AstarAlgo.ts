export class aNode {
    x: number;
    y: number;
    gCost: number = Infinity; // Cost from start to this node
    hCost: number = 0; // Heuristic cost from this node to the end
    fCost: number = 0; // Total cost (gCost + hCost)
    parent: aNode | null = null;
    isObstacle: boolean = false; // Indicates if the node is an obstacle

    constructor(x: number, y: number, isObstacle: boolean = false) {
        this.x = x;
        this.y = y;
        this.isObstacle = isObstacle;
    }

    calculateFCost() {
        this.fCost = this.gCost + this.hCost;
    }
}

export class AStarPathfinder {
    private openList: aNode[];
    private closedList: boolean[][];
    private grid: aNode[][];

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

    private getNeighbors(node: aNode): aNode[] {
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
    this.grid[startX][startY].calculateFCost();

    while (this.openList.length > 0) {
        const currentNode = this.getLowestFCostNode();
        if (!currentNode) {
            return null; // Path not found
        }

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
                neighbor.calculateFCost();

                if (!this.openList.includes(neighbor)) {
                    this.openList.push(neighbor);
                }
            }
        }
    }

    return null; // No path found
    }

    // ... Other helper methods as needed ...
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


function runTestCases() {
    const pathfinder = new AStarPathfinder(grid);

    // Test 1: Path from (0, 0) to (9, 9)
    console.log("Test 1: Path from (0, 0) to (9, 9)");
    let path = pathfinder.findPath(0, 0, 9, 9);
    if (path) {
        console.log("Path found:", path.map(node => `(${node.x}, ${node.y})`).join(" -> "));
    } else {
        console.log("No path found.");
    }
    printGrid(grid, grid[0][0], grid[9][9], path);

    // Test 2: Path from (0, 0) to (2, 5) - Directly into the barrier, expecting path around it
    console.log("Test 2: Path from (0, 0) to (0, 5)");
    path = pathfinder.findPath(0, 0, 0, 5);
    if (path) {
        console.log("Path found:", path.map(node => `(${node.x}, ${node.y})`).join(" -> "));
    } else {
        console.log("No path found.");
    }
    printGrid(grid, grid[0][0], grid[0][5], path);

    // Test 3: Path from (0, 0) to an enclosed location (1, 6), expecting no path
    console.log("Test 3: Path from (0, 0) to (1, 7) - Enclosed by obstacles");
    path = pathfinder.findPath(0, 0, 1, 7);
    if (path) {
        console.log("Path found:", path.map(node => `(${node.x}, ${node.y})`).join(" -> "));
    } else {
        console.log("No path found.");
    }
    printGrid(grid, grid[0][0], grid[1][7], path);
}


const gridRows = 10; // Number of rows in the grid
const gridCols = 10; // Number of columns in the grid

// Initialize the grid with aNode instances
const grid: aNode[][] = Array.from({ length: gridRows }, (_, x) =>
    Array.from({ length: gridCols }, (_, y) => new aNode(x, y))
);

//Function to mark a grid position as an obstacle
function addObstacle(x: number, y: number): void {
    if (x >= 0 && x < gridRows && y >= 0 && y < gridCols) {
        grid[x][y].isObstacle = true;
    }
}
// Adding a horizontal barrier with a gap
for (let i = 0; i < gridCols; i++) {
    if (i !== 4) { // Gap at (4, 2)
        addObstacle(2, i);
    }
}

addObstacle(4,0);
addObstacle(4,2);
addObstacle(4,3);
addObstacle(4,4);
addObstacle(4,5);

// Adding a vertical barrier with a gap
for (let j = 0; j < gridRows; j++) {
    if (j !== 5) { // Gap at (6, 5)
        addObstacle(j, 6);
    }
}

runTestCases();
