// Tree growth animation
let canvas, ctx;
let branches = [];
let roots = [];
let growthProgress = 0;
let animationId;
let lastTimestamp = 0;

// Initialize tree canvas and animation
function initTree() {
    canvas = document.getElementById('treeCanvas');
    ctx = canvas.getContext('2d');
    
    // Set canvas size to window size
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Create initial roots from all sides of the screen
    createInitialRoots();
    
    // Start animation
    lastTimestamp = performance.now();
    animateTree();
}

// Create initial roots from all edges of the screen - fewer to start
function createInitialRoots() {
    // Add roots from bottom (going up)
    for (let i = 0; i < 3; i++) {
        const rootX = Math.random() * canvas.width;
        const rootY = canvas.height;
        addRoot(rootX, rootY, -Math.PI/2 + (Math.random() * 0.6 - 0.3), 12);
    }
    
    // Add roots from sides and top - fewer and more selective
    // Left side (1 root)
    addRoot(
        0,
        canvas.height * 0.7,
        0 + (Math.random() * 0.4 - 0.2),
        10
    );
    
    // Right side (1 root)
    addRoot(
        canvas.width,
        canvas.height * 0.6,
        Math.PI + (Math.random() * 0.4 - 0.2),
        10
    );
    
    // One from top for variety
    addRoot(
        canvas.width * 0.4,
        0,
        Math.PI/2 + (Math.random() * 0.4 - 0.2),
        10
    );
}

// Add a root with specified parameters
function addRoot(x, y, angle, width) {
    const length = Math.max(canvas.width, canvas.height) * (0.08 + Math.random() * 0.1);
    
    roots.push({
        x: x,
        y: y,
        angle: angle,
        length: length,
        width: width + (Math.random() * 3),
        generation: 0,
        growthProgress: 0,
        children: [],
        maxChildren: getRandomInt(2, 4)  // Fewer children per branch
    });
}

// Resize canvas to window size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Clear and redraw if we're resizing after tree has started
    if (roots.length > 0) {
        clearCanvas();
        drawTree();
    }
}

// Clear canvas
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Main animation loop
function animateTree(timestamp = performance.now()) {
    const deltaTime = timestamp - lastTimestamp;
    lastTimestamp = timestamp;
    
    // Update growth progress - faster growth
    growthProgress += deltaTime * 0.0001; // Increased from 0.00005 to 0.0001
    
    // Clear canvas
    clearCanvas();
    
    // Update and draw the tree
    updateTree(deltaTime);
    drawTree();
    
    // Continue animation
    animationId = requestAnimationFrame(animateTree);
}

// Update tree growth
function updateTree(deltaTime) {
    // Grow existing roots
    growExistingRoots(deltaTime);
    
    // Create new branches
    createNewBranches();
    
    // Occasionally add new roots from edges - slightly more frequent
    if (Math.random() < 0.008) { // Increased from 0.005 to 0.008
        addRandomEdgeRoot();
    }
}

// Add a random root from one of the edges - mostly from bottom
function addRandomEdgeRoot() {
    // 70% chance to add from bottom, 10% for other sides
    const edgeChance = Math.random();
    
    if (edgeChance < 0.7) { // Bottom edge (most common)
        addRoot(
            Math.random() * canvas.width,
            canvas.height,
            -Math.PI/2 + (Math.random() * 0.6 - 0.3),
            3 + Math.random() * 5
        );
    } else if (edgeChance < 0.8) { // Top edge
        addRoot(
            Math.random() * canvas.width,
            0,
            Math.PI/2 + (Math.random() * 0.6 - 0.3),
            3 + Math.random() * 5
        );
    } else if (edgeChance < 0.9) { // Left edge
        addRoot(
            0,
            Math.random() * canvas.height,
            0 + (Math.random() * 0.6 - 0.3),
            3 + Math.random() * 5
        );
    } else { // Right edge
        addRoot(
            canvas.width,
            Math.random() * canvas.height,
            Math.PI + (Math.random() * 0.6 - 0.3),
            3 + Math.random() * 5
        );
    }
}

// Grow existing roots/branches
function growExistingRoots(deltaTime) {
    const growthSpeed = 0.0007; // Increased from 0.0004 to 0.0007
    
    // Update all roots and branches
    roots.forEach(root => {
        // Grow this root
        if (root.growthProgress < 1) {
            root.growthProgress += growthSpeed * deltaTime;
            if (root.growthProgress > 1) root.growthProgress = 1;
        }
        
        // Process children recursively
        updateBranch(root, deltaTime, growthSpeed);
    });
}

// Update a branch and its children
function updateBranch(branch, deltaTime, growthSpeed) {
    // Update each child
    branch.children.forEach(child => {
        // Grow this child (start branching a bit earlier)
        if (branch.growthProgress >= 0.7 && child.growthProgress < 1) { // Changed from 0.75 to 0.7
            child.growthProgress += growthSpeed * deltaTime * 0.8; // Increased from 0.7 to 0.8
            if (child.growthProgress > 1) child.growthProgress = 1;
        }
        
        // Process grandchildren
        updateBranch(child, deltaTime, growthSpeed);
    });
}

// Create new branches
function createNewBranches() {
    // Process roots first to add initial branches
    for (let i = 0; i < roots.length; i++) {
        const root = roots[i];
        
        // Only branch if this root is grown enough and has room for more children
        if (root.growthProgress >= 0.75 && root.children.length < root.maxChildren && Math.random() < 0.03) { // Increased from 0.02 to 0.03
            const childAngleRange = 0.8; // Narrower angle range
            const childAngle = root.angle + (Math.random() * childAngleRange - childAngleRange/2);
            const childLength = root.length * (0.6 + Math.random() * 0.2); // 60-80% of parent length
            
            // Calculate end point of the root
            const endX = root.x + Math.cos(root.angle) * root.length * root.growthProgress;
            const endY = root.y + Math.sin(root.angle) * root.length * root.growthProgress;
            
            // Create a new branch from this point
            const newBranch = {
                x: endX,
                y: endY,
                angle: childAngle,
                length: childLength,
                width: root.width * 0.7, // Thinner than parent
                generation: root.generation + 1,
                growthProgress: 0,
                children: [],
                maxChildren: root.generation < 10 ? getRandomInt(1, 3) : 0 // Allow deeper but sparser branching
            };
            
            root.children.push(newBranch);
        }
        
        // Process children recursively
        processChildrenForBranching(root);
    }
    
    // Add more roots from the edges - more frequently
    if (Math.random() < 0.015 && roots.length < 50) { // Increased from 0.01 to 0.015
        addRandomEdgeRoot();
    }
}

// Process children recursively for branching
function processChildrenForBranching(branch) {
    branch.children.forEach(child => {
        // Only branch if this child is grown enough and has room for more children - add randomness
        if (child.growthProgress >= 0.75 && child.children.length < child.maxChildren && Math.random() < 0.015) { // Increased from 0.01 to 0.015
            const childAngleRange = 0.9; // Moderate angle range
            const childAngle = child.angle + (Math.random() * childAngleRange - childAngleRange/2);
            const childLength = child.length * (0.6 + Math.random() * 0.2); // 60-80% of parent length
            
            // Calculate end point of the branch
            const endX = child.x + Math.cos(child.angle) * child.length * child.growthProgress;
            const endY = child.y + Math.sin(child.angle) * child.length * child.growthProgress;
            
            // Create a new branch from this point
            const newBranch = {
                x: endX,
                y: endY,
                angle: childAngle,
                length: childLength,
                width: child.width * 0.8, // Less thinning
                generation: child.generation + 1,
                growthProgress: 0,
                children: [],
                maxChildren: child.generation < 10 ? getRandomInt(1, 2) : 0 // Deeper but sparser branching
            };
            
            child.children.push(newBranch);
        }
        
        // Process grandchildren
        processChildrenForBranching(child);
    });
}

// Draw the entire tree
function drawTree() {
    ctx.strokeStyle = 'white';
    ctx.lineCap = 'round';
    
    // Draw all roots and their branches
    roots.forEach(root => {
        drawBranch(root);
    });
}

// Draw a single branch and its children
function drawBranch(branch) {
    if (branch.growthProgress <= 0) return;
    
    ctx.beginPath();
    ctx.moveTo(branch.x, branch.y);
    
    // Calculate the end point based on growth progress
    const endX = branch.x + Math.cos(branch.angle) * branch.length * branch.growthProgress;
    const endY = branch.y + Math.sin(branch.angle) * branch.length * branch.growthProgress;
    
    ctx.lineWidth = branch.width;
    ctx.lineTo(endX, endY);
    ctx.stroke();
    
    // Draw children
    branch.children.forEach(child => {
        drawBranch(child);
    });
}

// Helper function: Get random integer in range (inclusive)
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
} 