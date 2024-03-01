"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AStarPathfinder = exports.aNode = void 0;
var aNode = /** @class */ (function () {
    function aNode(x, y, isObstacle) {
        if (isObstacle === void 0) { isObstacle = false; }
        this.gCost = Infinity; // Cost from start to this node
        this.hCost = 0; // Heuristic cost from this node to the end
        this.fCost = 0; // Total cost (gCost + hCost)
        this.parent = null;
        this.isObstacle = false; // Indicates if the node is an obstacle
        this.x = x;
        this.y = y;
        this.isObstacle = isObstacle;
    }
    aNode.prototype.calculateFCost = function () {
        this.fCost = this.gCost + this.hCost;
    };
    return aNode;
}());
exports.aNode = aNode;
var AStarPathfinder = /** @class */ (function () {
    function AStarPathfinder(grid) {
        this.openList = [];
        this.closedList = [];
        this.grid = grid;
        this.initializeClosedList();
    }
    AStarPathfinder.prototype.initializeClosedList = function () {
        var _this = this;
        // Initialize the closed list based on the grid size,
        // setting all values to false (meaning not yet processed).
        this.closedList = this.grid.map(function () { return new Array(_this.grid[0].length).fill(false); });
    };
    //calculates distance from current to goal node
    AStarPathfinder.prototype.heuristic = function (node, goal) {
        // Implement your heuristic function here (Manhattan)
        return Math.abs(node.x - goal.x) + Math.abs(node.y - goal.y);
    };
    AStarPathfinder.prototype.getLowestFCostNode = function () {
        // Find and return the open list node with the lowest fCost.
        // If there is a tie, you may also consider the hCost.
        if (this.openList.length === 0) {
            return null;
        }
        var lowestFCostNode = this.openList[0];
        for (var _i = 0, _a = this.openList; _i < _a.length; _i++) {
            var node = _a[_i];
            if (node.fCost < lowestFCostNode.fCost || (node.fCost === lowestFCostNode.fCost && node.hCost < lowestFCostNode.hCost)) {
                lowestFCostNode = node;
            }
        }
        return lowestFCostNode;
    };
    AStarPathfinder.prototype.getNeighbors = function (node) {
        // Return the traversable neighbors of the given node.
        var neighbors = [];
        var directions = [
            { x: 0, y: -1 }, // up
            { x: 1, y: 0 }, // right
            { x: 0, y: 1 }, // down
            { x: -1, y: 0 } // left
        ];
        for (var _i = 0, directions_1 = directions; _i < directions_1.length; _i++) {
            var dir = directions_1[_i];
            var newX = node.x + dir.x;
            var newY = node.y + dir.y;
            if (newX >= 0 && newX < this.grid.length && newY >= 0 && newY < this.grid[0].length) {
                var potentialNeighbor = this.grid[newX][newY];
                if (!potentialNeighbor.isObstacle)
                    neighbors.push(potentialNeighbor);
            }
        }
        return neighbors;
    };
    AStarPathfinder.prototype.distance = function (nodeA, nodeB) {
        // Calculate and return the manhattan distance between nodeA and nodeB.
        var dx = Math.abs(nodeA.x - nodeB.x);
        var dy = Math.abs(nodeA.y - nodeB.y);
        return dx + dy; // Manhattan distance for 4-directional movement
    };
    AStarPathfinder.prototype.reconstructPath = function (endNode) {
        // Work backwards from the end node to reconstruct the path to the start node.
        var path = [];
        var currentNode = endNode;
        while (currentNode != null) {
            path.unshift(currentNode); // Add the node to the beginning of the path
            currentNode = currentNode.parent;
        }
        return path;
    };
    AStarPathfinder.prototype.findPath = function (startX, startY, goalX, goalY) {
        // A* Algorithm implementation based on the given start and goal coordinates.
        // This function should return the path as an array of aNode objects or null if no path is found.
        this.openList.push(this.grid[startX][startY]); // Add the start node to the open list
        this.grid[startX][startY].gCost = 0; // The cost of going from start to start is zero
        this.grid[startX][startY].hCost = this.heuristic(this.grid[startX][startY], this.grid[goalX][goalY]);
        this.grid[startX][startY].calculateFCost();
        while (this.openList.length > 0) {
            var currentNode = this.getLowestFCostNode();
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
            var neighbors = this.getNeighbors(currentNode);
            for (var _i = 0, neighbors_1 = neighbors; _i < neighbors_1.length; _i++) {
                var neighbor = neighbors_1[_i];
                if (this.closedList[neighbor.x][neighbor.y])
                    continue; // Skip if the neighbor is in the closed list
                var tentativeGCost = currentNode.gCost + this.distance(currentNode, neighbor);
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
    };
    return AStarPathfinder;
}());
exports.AStarPathfinder = AStarPathfinder;
function printGrid(grid, start, goal, path) {
    var gridString = "";
    for (var y = 0; y < grid[0].length; y++) { // Assuming grid is rectangular
        var _loop_1 = function (x) {
            var node = grid[x][y];
            if (node.x === start.x && node.y === start.y) {
                gridString += 'S ';
            }
            else if (node.x === goal.x && node.y === goal.y) {
                gridString += 'G ';
            }
            else if (node.isObstacle) {
                gridString += 'O ';
            }
            else if (path && path.some(function (pNode) { return pNode.x === node.x && pNode.y === node.y; })) {
                gridString += '. ';
            }
            else {
                gridString += '_ ';
            }
        };
        for (var x = 0; x < grid.length; x++) {
            _loop_1(x);
        }
        gridString += '\n'; // New line at the end of each row
    }
    console.log(gridString);
}
function runTestCases() {
    var pathfinder = new AStarPathfinder(grid);
    // Test 1: Path from (0, 0) to (9, 9)
    console.log("Test 1: Path from (0, 0) to (9, 9)");
    var path = pathfinder.findPath(0, 0, 9, 9);
    if (path) {
        console.log("Path found:", path.map(function (node) { return "(".concat(node.x, ", ").concat(node.y, ")"); }).join(" -> "));
    }
    else {
        console.log("No path found.");
    }
    printGrid(grid, grid[0][0], grid[9][9], path);
    // Test 2: Path from (0, 0) to (2, 5) - Directly into the barrier, expecting path around it
    console.log("Test 2: Path from (0, 0) to (0, 5)");
    path = pathfinder.findPath(0, 0, 0, 5);
    if (path) {
        console.log("Path found:", path.map(function (node) { return "(".concat(node.x, ", ").concat(node.y, ")"); }).join(" -> "));
    }
    else {
        console.log("No path found.");
    }
    printGrid(grid, grid[0][0], grid[0][5], path);
    // Test 3: Path from (0, 0) to an enclosed location (1, 6), expecting no path
    console.log("Test 3: Path from (0, 0) to (1, 7) - Enclosed by obstacles");
    path = pathfinder.findPath(0, 0, 1, 7);
    if (path) {
        console.log("Path found:", path.map(function (node) { return "(".concat(node.x, ", ").concat(node.y, ")"); }).join(" -> "));
    }
    else {
        console.log("No path found.");
    }
    printGrid(grid, grid[0][0], grid[1][7], path);
}
var gridRows = 10; // Number of rows in the grid
var gridCols = 10; // Number of columns in the grid
// Initialize the grid with aNode instances
var grid = Array.from({ length: gridRows }, function (_, x) {
    return Array.from({ length: gridCols }, function (_, y) { return new aNode(x, y); });
});
//Function to mark a grid position as an obstacle
function addObstacle(x, y) {
    if (x >= 0 && x < gridRows && y >= 0 && y < gridCols) {
        grid[x][y].isObstacle = true;
    }
}
// Adding a horizontal barrier with a gap
for (var i = 0; i < gridCols; i++) {
    if (i !== 4) { // Gap at (4, 2)
        addObstacle(2, i);
    }
}
addObstacle(4, 0);
addObstacle(4, 2);
addObstacle(4, 3);
addObstacle(4, 4);
addObstacle(4, 5);
// Adding a vertical barrier with a gap
for (var j = 0; j < gridRows; j++) {
    if (j !== 5) { // Gap at (6, 5)
        addObstacle(j, 6);
    }
}
runTestCases();