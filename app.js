// --- 1. MATTER.JS SETUP ---
const Engine = Matter.Engine,
      Render = Matter.Render,
      Runner = Matter.Runner,
      Bodies = Matter.Bodies,
      Composite = Matter.Composite,
      Events = Matter.Events;

const engine = Engine.create();
engine.world.gravity.y = 0; 
engine.world.gravity.x = 0;

const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: 600,
        height: 800,
        wireframes: false,
        background: '#1E5945' 
    }
});

Render.run(render);
const runner = Runner.create();
Runner.run(runner, engine);


// --- 2. GAME SYSTEMS (CLUBS & PLAYERS) ---
let ball, green, cup;
let gameState = 'IDLE'; 
let strokeCount = 0;
let isAiming = false;
let startPoint = null;
let currentLevel = 0;

// High-Sensitivity Clubs
const CLUBS = {
    'DRIVER': { maxForce: 0.6, multiplier: -0.006, color: '#FF4136' }, 
    'IRON':   { maxForce: 0.3, multiplier: -0.003, color: '#0074D9' }, 
    'PUTTER': { maxForce: 0.1, multiplier: -0.001, color: '#FED101' }  
};
let activeClubKeys = ['DRIVER', 'IRON', 'PUTTER'];
let activeClubIndex = 1; 

const PLAYERS = [
    { id: 'P1', color: '#FED101', density: 0.04 }, 
    { id: 'P2', color: '#F012BE', density: 0.06 }, 
    { id: 'P3', color: '#FFFFFF', density: 0.03 }  
];
let activePlayerIndex = 0;

document.addEventListener('keydown', (e) => {
    if (gameState !== 'IDLE') return; 

    if (e.code === 'Space') {
        activeClubIndex = (activeClubIndex + 1) % activeClubKeys.length;
        document.getElementById('ui-club').innerText = activeClubKeys[activeClubIndex];
        document.getElementById('ui-club').style.color = CLUBS[activeClubKeys[activeClubIndex]].color;
    }
    
    if (e.code === 'KeyP') {
        activePlayerIndex = (activePlayerIndex + 1) % PLAYERS.length;
        document.getElementById('ui-player').innerText = PLAYERS[activePlayerIndex].id;
        document.getElementById('ui-player').style.color = PLAYERS[activePlayerIndex].color;
        
        if (ball) {
            ball.render.fillStyle = PLAYERS[activePlayerIndex].color;
            Matter.Body.setDensity(ball, PLAYERS[activePlayerIndex].density);
        }
    }
});


// --- 3. LEVEL BUILDING LOGIC ---
function loadLevel(levelIndex) {
    const levelData = courseData[levelIndex]; 
    Matter.Composite.clear(engine.world);
    Matter.Engine.clear(engine);

    document.getElementById('ui-hole').innerText = levelData.hole;
    document.getElementById('ui-par').innerText = levelData.par;
    document.getElementById('ui-strokes').innerText = '0';

    green = Bodies.rectangle(levelData.green.x, levelData.green.y, levelData.green.width, levelData.green.height, { 
        isStatic: true, isSensor: true, render: { fillStyle: '#2E8B57' }, label: 'green'
    });

    cup = Bodies.circle(levelData.hole_pos.x, levelData.hole_pos.y, levelData.hole_pos.radius, {
        isStatic: true, isSensor: true, render: { fillStyle: '#000000' }, label: 'cup'
    });

    let hazardBodies = [];
    if(levelData.water) {
        levelData.water.forEach(w => {
            hazardBodies.push(Bodies.rectangle(w.x, w.y, w.width, w.height, { 
                isStatic: true, isSensor: true, render: { fillStyle: '#1E3A8A' }, label: 'water' 
            }));
        });
    }
    if(levelData.sand) {
        levelData.sand.forEach(s => {
            hazardBodies.push(Bodies.rectangle(s.x, s.y, s.width, s.height, { 
                isStatic: true, isSensor: true, render: { fillStyle: '#C2B280' }, label: 'sand' 
            }));
        });
    }
    if(levelData.bumpers) {
        levelData.bumpers.forEach(b => {
            hazardBodies.push(Bodies.rectangle(b.x, b.y, b.width, b.height, { 
                isStatic: true, 
                restitution: 0.6, 
                // Wood styling with outline
                render: { fillStyle: '#8B4513', strokeStyle: '#5C3317', lineWidth: 4 }, 
                label: 'bumper' 
            }));
        });
    }

    let currentPlayer = PLAYERS[activePlayerIndex];
    ball = Bodies.circle(levelData.start_pos.x, levelData.start_pos.y, 10, {
        restitution: 0.8, friction: 0.005, frictionAir: 0.015, density: currentPlayer.density, 
        render: { fillStyle: currentPlayer.color }, label: 'ball'
    });

    const wallOpts = { isStatic: true, restitution: 0.5, render: { fillStyle: '#0A2E1C' } }; 
    const topW = Bodies.rectangle(300, -25, 650, 50, wallOpts);
    const botW = Bodies.rectangle(300, 825, 650, 50, wallOpts);
    const leftW = Bodies.rectangle(-25, 400, 50, 850, wallOpts);
    const rightW = Bodies.rectangle(625, 400, 50, 850, wallOpts);

    Composite.add(engine.world, [green, cup, ball, topW, botW, leftW, rightW, ...hazardBodies]);
    gameState = 'IDLE';
    strokeCount = 0;
}

loadLevel(currentLevel);


// --- 4. CONTROLS & AIMING ---
document.addEventListener('mousedown', (event) => {
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
        document.getElementById('ui-strokes').innerText = strokeCount;
        
        let endPoint = { x: event.clientX, y: event.clientY };
        let activeClub = CLUBS[activeClubKeys[activeClubIndex]];
        
        let forceX = (endPoint.x - startPoint.x) * activeClub.multiplier;
        let forceY = (endPoint.y - startPoint.y) * activeClub.multiplier;

        let forceMagnitude = Math.sqrt(forceX * forceX + forceY * forceY);
        if (forceMagnitude > activeClub.maxForce) {
            let scale = activeClub.maxForce / forceMagnitude;
            forceX *= scale;
            forceY *= scale;
        }

        Matter.Body.applyForce(ball, ball.position, { x: forceX, y: forceY });
    }
});


// --- 5. GAME LOOP & VISUALS ---
let currentMousePos = null;
document.addEventListener('mousemove', (event) => {
    if (isAiming) currentMousePos = { x: event.clientX, y: event.clientY };
});

Events.on(render, 'afterRender', function() {
    if (isAiming && startPoint && currentMousePos) {
        const context = render.context;
        let activeClub = CLUBS[activeClubKeys[activeClubIndex]];
        
        let dragX = currentMousePos.x - startPoint.x;
        let dragY = currentMousePos.y - startPoint.y;
        
        context.beginPath();
        context.moveTo(ball.position.x, ball.position.y);
        context.lineTo(ball.position.x - dragX, ball.position.y - dragY);
        
        context.strokeStyle = activeClub.color; 
        context.lineWidth = 4;
        context.setLineDash([5, 5]); 
        context.stroke();
        context.setLineDash([]); 
    }
});

Events.on(engine, 'beforeUpdate', function() {
    if (gameState === 'MOVING') {
        let speed = Math.sqrt(ball.velocity.x * ball.velocity.x + ball.velocity.y * ball.velocity.y);
        
        let inSand = false;
        const collisions = Matter.Detector.collisions(engine.detector);
        collisions.forEach(collision => {
            if ((collision.bodyA.label === 'ball' && collision.bodyB.label === 'sand') ||
                (collision.bodyB.label === 'ball' && collision.bodyA.label === 'sand')) {
                inSand = true;
            }
        });
        ball.frictionAir = inSand ? 0.08 : 0.015;

        if (speed < 0.2) {
            Matter.Body.setVelocity(ball, { x: 0, y: 0 }); 
            gameState = 'IDLE';
        }
    }
});


// --- 6. COLLISION LOGIC ---
Events.on(engine, 'collisionStart', function(event) {
    const pairs = event.pairs;
    for (let i = 0; i < pairs.length; i++) {
        const bodyA = pairs[i].bodyA;
        const bodyB = pairs[i].bodyB;

        if ((bodyA.label === 'water' && bodyB.label === 'ball') || (bodyB.label === 'water' && bodyA.label === 'ball')) {
            gameState = 'IDLE';
            strokeCount++; 
            document.getElementById('ui-strokes').innerText = strokeCount;
            Matter.Body.setVelocity(ball, { x: 0, y: 0 });
            Matter.Body.setPosition(ball, courseData[currentLevel].start_pos);
            return;
        }

        if ((bodyA.label === 'cup' && bodyB.label === 'ball') || (bodyB.label === 'cup' && bodyA.label === 'ball')) {
            let speed = Math.sqrt(ball.velocity.x * ball.velocity.x + ball.velocity.y * ball.velocity.y);
            if (speed > 6) return; 

            gameState = 'HOLED';
            Matter.Body.setVelocity(ball, { x: 0, y: 0 });
            Matter.Body.setPosition(ball, { x: cup.position.x, y: cup.position.y }); 
            
            setTimeout(() => {
                alert(`Hole ${courseData[currentLevel].hole} complete in ${strokeCount} strokes!`);
                currentLevel++;
                if (currentLevel >= courseData.length) {
                    alert("Congratulations! You completed the 9-Hole Course!");
                    currentLevel = 0; 
                }
                loadLevel(currentLevel); 
            }, 500);
        }
    }
});
