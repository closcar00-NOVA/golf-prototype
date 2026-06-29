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
});
