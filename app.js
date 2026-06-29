// --- NEW AIMING MECHANIC ---

let isAiming = false;
let startPoint = null;

// Listen for mouse down anywhere on the screen
document.addEventListener('mousedown', (event) => {
    // Only allow aiming if the ball is practically stopped
    if (ball.speed < 0.1) {
        isAiming = true;
        startPoint = { x: event.clientX, y: event.clientY };
    }
});

// Listen for mouse up (The Swing)
document.addEventListener('mouseup', (event) => {
    if (isAiming) {
        isAiming = false;
        let endPoint = { x: event.clientX, y: event.clientY };
        
        // 1. Calculate the Vector
        // We subtract start from end, but multiply by a negative power multiplier 
        // to create a "slingshot" (pull back to shoot forward)
        let powerMultiplier = -0.0005;
        let forceX = (endPoint.x - startPoint.x) * powerMultiplier;
        let forceY = (endPoint.y - startPoint.y) * powerMultiplier;

        // 2. Cap the Maximum Power
        // This prevents the player from dragging off-screen to get infinite power
        const maxForce = 0.15;
        
        // A little math to limit the total force magnitude
        let forceMagnitude = Math.sqrt(forceX * forceX + forceY * forceY);
        if (forceMagnitude > maxForce) {
            let scale = maxForce / forceMagnitude;
            forceX *= scale;
            forceY *= scale;
        }

        // 3. Apply the force to the center of the ball
        Matter.Body.applyForce(ball, ball.position, { x: forceX, y: forceY });
    }
});