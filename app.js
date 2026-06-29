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
        frictionAir: 0.03,
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
        
        let powerMultiplier = -0.0005;
        let forceX = (endPoint.x - startPoint.x) * powerMultiplier;
        let forceY = (endPoint.y - startPoint.y) * powerMultiplier;

        const maxForce = 0.15;
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
