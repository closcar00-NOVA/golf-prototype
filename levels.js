const courseData = [
    // HOLE 1: The Chute (Intro to bumpers)
    {
        hole: 1, par: 3,
        start_pos: { x: 300, y: 650 },
        green: { x: 300, y: 150, width: 200, height: 200 },
        hole_pos: { x: 300, y: 100, radius: 12 },
        water: [], sand: [],
        bumpers: [
            { x: 190, y: 350, width: 20, height: 700 }, 
            { x: 410, y: 350, width: 20, height: 700 },
            { x: 300, y: 40, width: 240, height: 20 }
        ]
    },
    // HOLE 2: The Split (Bank shot required)
    {
        hole: 2, par: 3,
        start_pos: { x: 300, y: 650 },
        green: { x: 300, y: 150, width: 300, height: 200 },
        hole_pos: { x: 300, y: 100, radius: 12 },
        water: [], sand: [],
        bumpers: [
            { x: 300, y: 400, width: 150, height: 20 }, // Center block
            { x: 140, y: 400, width: 20, height: 800 },
            { x: 460, y: 400, width: 20, height: 800 }
        ]
    },
    // HOLE 3: Sand Trap City
    {
        hole: 3, par: 4,
        start_pos: { x: 300, y: 650 },
        green: { x: 300, y: 150, width: 300, height: 200 },
        hole_pos: { x: 300, y: 100, radius: 12 },
        water: [],
        sand: [
            { x: 200, y: 350, width: 100, height: 100 },
            { x: 400, y: 350, width: 100, height: 100 }
        ],
        bumpers: []
    },
    // HOLE 4: The River
    {
        hole: 4, par: 4,
        start_pos: { x: 300, y: 700 },
        green: { x: 300, y: 150, width: 400, height: 200 },
        hole_pos: { x: 300, y: 100, radius: 12 },
        water: [
            { x: 300, y: 450, width: 600, height: 100 } // Crosses entire screen
        ],
        sand: [], bumpers: []
    },
    // HOLE 5: Pinball Alley
    {
        hole: 5, par: 4,
        start_pos: { x: 300, y: 700 },
        green: { x: 300, y: 100, width: 200, height: 150 },
        hole_pos: { x: 300, y: 70, radius: 12 },
        water: [], sand: [],
        bumpers: [
            { x: 200, y: 500, width: 150, height: 20 },
            { x: 400, y: 350, width: 150, height: 20 },
            { x: 200, y: 200, width: 150, height: 20 }
        ]
    },
    // HOLE 6: The Dogleg Left
    {
        hole: 6, par: 4,
        start_pos: { x: 450, y: 650 },
        green: { x: 150, y: 200, width: 200, height: 200 },
        hole_pos: { x: 150, y: 150, radius: 12 },
        water: [], 
        sand: [ { x: 450, y: 200, width: 200, height: 200 } ],
        bumpers: [
            { x: 300, y: 450, width: 400, height: 20 } // Blocks direct shot
        ]
    },
    // HOLE 7: The Bridge
    {
        hole: 7, par: 5,
        start_pos: { x: 300, y: 700 },
        green: { x: 300, y: 100, width: 150, height: 150 },
        hole_pos: { x: 300, y: 70, radius: 12 },
        water: [
            { x: 100, y: 400, width: 250, height: 400 }, // Left water
            { x: 500, y: 400, width: 250, height: 400 }  // Right water
        ],
        sand: [],
        bumpers: [
            { x: 220, y: 400, width: 10, height: 400 }, // Left rail of bridge
            { x: 380, y: 400, width: 10, height: 400 }  // Right rail of bridge
        ]
    },
    // HOLE 8: Bunker Island
    {
        hole: 8, par: 4,
        start_pos: { x: 300, y: 700 },
        green: { x: 300, y: 200, width: 150, height: 150 },
        hole_pos: { x: 300, y: 200, radius: 12 },
        water: [],
        sand: [
            { x: 300, y: 200, width: 350, height: 350 } // Massive sand trap surrounding green
        ],
        bumpers: []
    },
    // HOLE 9: The Final Exam
    {
        hole: 9, par: 5,
        start_pos: { x: 300, y: 720 },
        green: { x: 300, y: 80, width: 200, height: 120 },
        hole_pos: { x: 300, y: 60, radius: 12 },
        water: [
            { x: 300, y: 550, width: 600, height: 60 },
            { x: 300, y: 250, width: 600, height: 60 }
        ],
        sand: [
            { x: 150, y: 400, width: 100, height: 100 },
            { x: 450, y: 400, width: 100, height: 100 }
        ],
        bumpers: [
            { x: 300, y: 400, width: 100, height: 20 }
        ]
    }
];
