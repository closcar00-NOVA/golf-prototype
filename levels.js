// levels.js - This holds the blueprint for all 18 holes
const courseData = [
    {
        hole: 1,
        par: 3,
        start_pos: { x: 300, y: 700 }, // Where the ball spawns
        green: { x: 300, y: 150, width: 300, height: 200 }, // The target area
        hole_pos: { x: 300, y: 100, radius: 15 } // The actual physical cup
    }
    // We will add Hole 2, Hole 3, etc. here later
];
