// --- THE SWING (Replaces your old mouseup event) ---
document.addEventListener('mouseup', (event) => {
    // Ensure they can only shoot when IDLE and Aiming
    if (isAiming && gameState === 'IDLE') { 
        isAiming = false;
        gameState = 'MOVING'; // Lock inputs so they can't shoot twice
        strokeCount++; // Add a stroke to the scorecard
        
        let endPoint = { x: event.clientX, y: event.clientY };
        
        // Calculate slingshot vector
        let powerMultiplier = -0.0005;
        let forceX = (endPoint.x - startPoint.x) * powerMultiplier;
        let forceY = (endPoint.y - startPoint.y) * powerMultiplier;

        // Cap the maximum power
        const maxForce = 0.15;
        let forceMagnitude = Math.sqrt(forceX * forceX + forceY * forceY);
        if (forceMagnitude > maxForce) {
            let scale = maxForce / forceMagnitude;
            forceX *= scale;
            forceY *= scale;
        }

        // Apply force to the ball
        Matter.Body.applyForce(ball, ball.position, { x: forceX, y: forceY });
        console.log(`Stroke count: ${strokeCount}`);
    }
    // Global variables so we can access them anywhere
let ball;
let green;
let cup;

function loadLevel(levelIndex) {
    // 1. Get the data for the specific hole (0 is Hole 1)
    const levelData = courseData[levelIndex]; 

    // 2. Clear out any old bodies if we are moving to a new level
    Matter.Composite.clear(engine.world);
    Matter.Engine.clear(engine);

    // 3. Build the Green based on levels.js
    green = Bodies.rectangle(levelData.green.x, levelData.green.y, levelData.green.width, levelData.green.height, { 
        isStatic: true,
        isSensor: true,
        render: { fillStyle: '#00985A' } 
    });

    // 4. Build the Cup (The actual hole)
    cup = Bodies.circle(levelData.hole_pos.x, levelData.hole_pos.y, levelData.hole_pos.radius, {
        isStatic: true,
        isSensor: true,
        render: { fillStyle: '#000000' } // Black hole on the green
    });

    // 5. Build the Ball at the start_pos
    ball = Bodies.circle(levelData.start_pos.x, levelData.start_pos.y, 10, {
        restitution: 0.8,
        friction: 0.005,
        frictionAir: 0.03,
        density: 0.04,
        render: { fillStyle: '#FED101' }
    });

    // Add boundaries back in
    const wallOptions = { isStatic: true, render: { visible: false } };
    const topWall = Bodies.rectangle(300, -10, 620, 20, wallOptions);
    const bottomWall = Bodies.rectangle(300, 810, 620, 20, wallOptions);
    const leftWall = Bodies.rectangle(-10, 400, 20, 820, wallOptions);
    const rightWall = Bodies.rectangle(610, 400, 20, 820, wallOptions);

    // Add everything to the physics world
    Composite.add(engine.world, [green, cup, ball, topWall, bottomWall, leftWall, rightWall]);

    // Reset game state
    gameState = 'IDLE';
    strokeCount = 0;
}

// Call the function to build Hole 1 immediately when the game loads!
loadLevel(0);
});
