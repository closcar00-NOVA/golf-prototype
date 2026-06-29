// --- 1. MATTER.JS SETUP ---
const Engine = Matter.Engine,
      Render = Matter.Render,
      Runner = Matter.Runner,
      Bodies = Matter.Bodies,
      Composite = Matter.Composite,
      Events = Matter.Events;

// Create the engine and turn off gravity for top-down view
const engine = Engine.create();
engine.world.gravity.y = 0; 
engine.world.gravity.x = 0;

// Create the renderer
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: 600,
        height: 800,
        wireframes: false,
        background: 'transparent'
    }
});

// Run the engine
Render.run(render);
const runner = Runner.create();
Runner.run(runner, engine);


// --- 2. GLOBAL GAME VARIABLES ---
let ball;
let green;
let cup;
let gameState = 'IDLE'; 
let strokeCount = 0;
let isAiming = false;
let startPoint = null;


// --- 3. LEVEL BUILDING LOGIC ---
function loadLevel(levelIndex) {
    const levelData = courseData[levelIndex]; 

    // Clear old bodies
    Matter.Composite.clear(engine.world);
    Matter.Engine.clear(engine);

    // Build Green
    green = Bodies.rectangle(levelData.green.x, levelData.green.y, levelData.green.width, levelData.green.height, { 
        isStatic: true,
        isSensor: true,
        render: { fillStyle: '#00985A' } 
    });

    // Build Cup
    cup = Bodies.circle(levelData.hole_pos.x, levelData.hole_pos.y, levelData.hole_pos.radius, {
        isStatic: true,
        isSensor: true,
        render: { fillStyle: '#000000' }
    });

    // Build Ball
    ball = Bodies.circle(levelData.start_pos.x, levelData.start_pos.y, 10, {
        restitution: 0.8,
        friction: 0.005,
        frictionAir: 0.015,
        density: 0.04,
        render: { fillStyle: '#FED101' }
    });

    // Build Walls
    const wallOptions = { isStatic: true, render: { visible: false } };
    const topWall = Bodies.rectangle(300, -10, 620, 20, wallOptions);
    const bottomWall = Bodies.rectangle(300, 810, 620, 20, wallOptions);
    const leftWall = Bodies.rectangle(-10, 400, 20, 820, wallOptions);
    const rightWall = Bodies.rectangle(610, 400, 20, 820, wallOptions);

    Composite.add(engine.world, [green, cup, ball, topWall, bottomWall, leftWall, rightWall]);

    gameState = 'IDLE';
    strokeCount = 0;
}

// Immediately load Hole 1
loadLevel(0);


// --- 4. CONTROLS & AIMING ---
document.addEventListener('mousedown', (event) => {
    // Only aim if idle and the ball exists/is stopped
    if (gameState === 'IDLE' && ball && ball.speed < 0.1) {
        isAiming = true;
        startPoint = { x: event.clientX, y: event.clientY };
    }
});

document.addEventListener('mouseup', (event) => {
    if (isAiming && gameState === 'IDLE') { 
        isAiming = false;
        gameState = 'MOVING'; 
        strokeCount++; 
        
        let endPoint = { x: event.clientX, y: event.clientY };
        
        let powerMultiplier = -0.002;
        let forceX = (endPoint.x - startPoint.x) * powerMultiplier;
        let forceY = (endPoint.y - startPoint.y) * powerMultiplier;

        const maxForce = 0.5;
        let forceMagnitude = Math.sqrt(forceX * forceX + forceY * forceY);
        if (forceMagnitude > maxForce) {
            let scale = maxForce / forceMagnitude;
            forceX *= scale;
            forceY *= scale;
        }

        Matter.Body.applyForce(ball, ball.position, { x: forceX, y: forceY });
        console.log(`Stroke count: ${strokeCount}`);
    }
});


// --- 5. GAME LOOP (SPEED TRACKING) ---
Events.on(engine, 'beforeUpdate', function() {
    if (gameState === 'MOVING') {
        let speed = Math.sqrt(
            ball.velocity.x * ball.velocity.x + 
            ball.velocity.y * ball.velocity.y
        );

        if (speed < 0.2) {
            Matter.Body.setVelocity(ball, { x: 0, y: 0 }); 
            gameState = 'IDLE';
            console.log(`Stroke ${strokeCount} finished.`);
        }
    }
});

// --- 6. VISUAL AIMING (The Power Line) ---
let currentMousePos = null;

// Track the mouse while dragging
document.addEventListener('mousemove', (event) => {
    if (isAiming) {
        currentMousePos = { x: event.clientX, y: event.clientY };
    }
});

// Draw the line on the screen every frame
Events.on(render, 'afterRender', function() {
    if (isAiming && startPoint && currentMousePos) {
        const context = render.context;
        
        // Calculate how far the mouse has been dragged
        let dragX = currentMousePos.x - startPoint.x;
        let dragY = currentMousePos.y - startPoint.y;
        
        // Draw the aim line coming OUT of the ball in the opposite direction (slingshot)
        context.beginPath();
        context.moveTo(ball.position.x, ball.position.y);
        context.lineTo(ball.position.x - dragX, ball.position.y - dragY);
        
        context.strokeStyle = '#FED101'; // Your brand's sharp yellow
        context.lineWidth = 4;
        context.setLineDash([5, 5]); // Makes it a dashed line for a clean UI look
        context.stroke();
        context.setLineDash([]); // Reset dash for other drawing
    }
});

// --- 7. COLLISION LOGIC (Sinking the Putt) ---
Events.on(engine, 'collisionStart', function(event) {
    const pairs = event.pairs;

    for (let i = 0; i < pairs.length; i++) {
        const bodyA = pairs[i].bodyA;
        const bodyB = pairs[i].bodyB;

        // Check if the collision involves the ball and the cup
        if ((bodyA === ball && bodyB === cup) || (bodyB === ball && bodyA === cup)) {
            
            // Calculate how fast the ball is moving
            let speed = Math.sqrt(ball.velocity.x * ball.velocity.x + ball.velocity.y * ball.velocity.y);

            // If the ball is moving too fast, it skips over the hole!
            if (speed > 6) {
                console.log("Too fast! The ball skipped over the hole.");
                return; 
            }

            // --- THE BALL DROPS IN ---
            console.log(`Hole complete! Strokes: ${strokeCount}`);
            
            // 1. Lock the game state
            gameState = 'HOLED';
            
            // 2. Stop the ball dead in its tracks and snap it to the center of the cup
            Matter.Body.setVelocity(ball, { x: 0, y: 0 });
            Matter.Body.setPosition(ball, { x: cup.position.x, y: cup.position.y }); 
            
            // 3. Short delay so the player sees the ball drop, then show the scorecard
            setTimeout(() => {
                alert(`Nice putt! You finished the hole in ${strokeCount} strokes.`);
                
                // Reset to Hole 1 for now. (We will build Hole 2 in levels.js later).
                loadLevel(0); 
            }, 500);
        }
    }
});
