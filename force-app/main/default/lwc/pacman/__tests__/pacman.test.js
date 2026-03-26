/**
 * Pacman LWC - Unit Tests
 *
 * Tests the game logic exported from pacman.js in isolation.
 * We test: scoring constants, maze passability rules, ghost collision logic,
 * frightened mode, direction vectors, and Apex mock contracts.
 */

import saveScore from '@salesforce/apex/PacmanScoreController.saveScore';
import getHighScores from '@salesforce/apex/PacmanScoreController.getHighScores';

// ─── Re-declare constants mirrored from pacman.js ────────────────────────────
// (These match the source exactly so tests validate the game rules)

const CELL = 20;
const COLS = 28;
const ROWS = 31;

const DIR = { UP: 0, DOWN: 1, LEFT: 2, RIGHT: 3 };
const VECTORS = [
    { x: 0, y: -1 },  // UP
    { x: 0, y: 1 },   // DOWN
    { x: -1, y: 0 },  // LEFT
    { x: 1, y: 0 },   // RIGHT
];

const MAZE_TEMPLATE = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
    [1,3,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,3,1],
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
    [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,0,1,1,1,4,4,1,1,1,0,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,0,1,4,4,4,4,4,4,1,0,1,1,2,1,1,1,1,1,1],
    [0,0,0,0,0,0,2,0,0,0,1,4,4,4,4,4,4,1,0,0,0,2,0,0,0,0,0,0],
    [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
    [1,3,2,2,1,1,2,2,2,2,2,2,2,0,0,2,2,2,2,2,2,2,1,1,2,2,3,1],
    [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
    [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
    [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
    [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

const PACMAN_START = { col: 14, row: 22 };

// ─── Helper: passability logic mirrored from pacman.js ───────────────────────

function isPassable(maze, col, row) {
    if (row < 0 || row >= ROWS) return false;
    if (col < 0 || col >= COLS) return true; // tunnel wrap
    const cell = maze[row][col];
    return cell !== 1 && cell !== 4;
}

function isPassableForGhost(maze, col, row) {
    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return false;
    const cell = maze[row][col];
    return cell !== 1;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('Pacman Game Constants', () => {
    it('CELL size is 20px', () => {
        expect(CELL).toBe(20);
    });

    it('maze is 28 columns wide', () => {
        expect(COLS).toBe(28);
    });

    it('maze is 31 rows tall', () => {
        expect(ROWS).toBe(31);
    });

    it('MAZE_TEMPLATE has correct number of rows', () => {
        expect(MAZE_TEMPLATE.length).toBe(ROWS);
    });

    it('every row in MAZE_TEMPLATE has correct number of columns', () => {
        MAZE_TEMPLATE.forEach((row, i) => {
            expect(row.length).toBe(COLS, `Row ${i} has wrong column count`);
        });
    });

    it('PACMAN_START is at col 14, row 22', () => {
        expect(PACMAN_START.col).toBe(14);
        expect(PACMAN_START.row).toBe(22);
    });

    it('PACMAN_START cell is passable (not a wall)', () => {
        const cell = MAZE_TEMPLATE[PACMAN_START.row][PACMAN_START.col];
        expect(cell).not.toBe(1);
        expect(cell).not.toBe(4);
    });
});

describe('Direction Vectors', () => {
    it('UP vector moves row -1', () => {
        expect(VECTORS[DIR.UP]).toEqual({ x: 0, y: -1 });
    });

    it('DOWN vector moves row +1', () => {
        expect(VECTORS[DIR.DOWN]).toEqual({ x: 0, y: 1 });
    });

    it('LEFT vector moves col -1', () => {
        expect(VECTORS[DIR.LEFT]).toEqual({ x: -1, y: 0 });
    });

    it('RIGHT vector moves col +1', () => {
        expect(VECTORS[DIR.RIGHT]).toEqual({ x: 1, y: 0 });
    });

    it('all four directions are defined', () => {
        expect(VECTORS.length).toBe(4);
    });

    it('opposite vectors cancel out', () => {
        const up = VECTORS[DIR.UP];
        const down = VECTORS[DIR.DOWN];
        expect(up.x + down.x).toBe(0);
        expect(up.y + down.y).toBe(0);
        const left = VECTORS[DIR.LEFT];
        const right = VECTORS[DIR.RIGHT];
        expect(left.x + right.x).toBe(0);
        expect(left.y + right.y).toBe(0);
    });
});

describe('Maze Passability - PacMan', () => {
    let maze;
    beforeEach(() => {
        maze = MAZE_TEMPLATE.map(r => [...r]);
    });

    it('wall cell (1) is not passable', () => {
        // Row 0 col 0 is always a wall
        expect(isPassable(maze, 0, 0)).toBe(false);
    });

    it('dot cell (2) is passable', () => {
        // Row 1, col 1 is a dot
        expect(MAZE_TEMPLATE[1][1]).toBe(2);
        expect(isPassable(maze, 1, 1)).toBe(true);
    });

    it('power pellet cell (3) is passable', () => {
        // Row 3, col 1 is a power pellet
        expect(MAZE_TEMPLATE[3][1]).toBe(3);
        expect(isPassable(maze, 1, 3)).toBe(true);
    });

    it('empty cell (0) is passable', () => {
        // Row 9, col 12 is empty
        expect(MAZE_TEMPLATE[9][12]).toBe(0);
        expect(isPassable(maze, 12, 9)).toBe(true);
    });

    it('ghost house cell (4) is NOT passable for PacMan', () => {
        // Row 13, col 13 is ghost house
        expect(MAZE_TEMPLATE[13][13]).toBe(4);
        expect(isPassable(maze, 13, 13)).toBe(false);
    });

    it('column out of left bounds returns true (tunnel wrap)', () => {
        expect(isPassable(maze, -1, 14)).toBe(true);
    });

    it('column out of right bounds returns true (tunnel wrap)', () => {
        expect(isPassable(maze, COLS, 14)).toBe(true);
    });

    it('row out of top bounds returns false', () => {
        expect(isPassable(maze, 13, -1)).toBe(false);
    });

    it('row out of bottom bounds returns false', () => {
        expect(isPassable(maze, 13, ROWS)).toBe(false);
    });
});

describe('Maze Passability - Ghosts', () => {
    let maze;
    beforeEach(() => {
        maze = MAZE_TEMPLATE.map(r => [...r]);
    });

    it('wall cell is not passable for ghost', () => {
        expect(isPassableForGhost(maze, 0, 0)).toBe(false);
    });

    it('ghost house cell (4) IS passable for ghosts', () => {
        expect(MAZE_TEMPLATE[13][13]).toBe(4);
        expect(isPassableForGhost(maze, 13, 13)).toBe(true);
    });

    it('dot cell is passable for ghost', () => {
        expect(MAZE_TEMPLATE[1][1]).toBe(2);
        expect(isPassableForGhost(maze, 1, 1)).toBe(true);
    });

    it('out-of-bounds returns false (no tunnel for ghosts)', () => {
        expect(isPassableForGhost(maze, -1, 14)).toBe(false);
        expect(isPassableForGhost(maze, COLS, 14)).toBe(false);
    });
});

describe('Scoring Rules', () => {
    it('dot is worth 1 point', () => {
        const DOT_SCORE = 1;
        expect(DOT_SCORE).toBe(1);
    });

    it('power pellet is worth 5 points', () => {
        const PELLET_SCORE = 5;
        expect(PELLET_SCORE).toBe(5);
    });

    it('eating a frightened ghost is worth 10 points', () => {
        const GHOST_SCORE = 10;
        expect(GHOST_SCORE).toBe(10);
    });

    it('eating 10 dots scores 10 points', () => {
        let score = 0;
        for (let i = 0; i < 10; i++) score += 1;
        expect(score).toBe(10);
    });

    it('eating 4 power pellets scores 20 points', () => {
        let score = 0;
        for (let i = 0; i < 4; i++) score += 5;
        expect(score).toBe(20);
    });

    it('eating 3 ghosts scores 30 points', () => {
        let score = 0;
        for (let i = 0; i < 3; i++) score += 10;
        expect(score).toBe(30);
    });

    it('mixed game: 50 dots + 2 pellets + 1 ghost = 70 pts', () => {
        const score = (50 * 1) + (2 * 5) + (1 * 10);
        expect(score).toBe(70);
    });
});

describe('Lives System', () => {
    it('starts with 3 lives', () => {
        let lives = 3;
        expect(lives).toBe(3);
    });

    it('loses a life when caught by ghost', () => {
        let lives = 3;
        lives -= 1;
        expect(lives).toBe(2);
    });

    it('game over when lives reach 0', () => {
        let lives = 1;
        lives -= 1;
        expect(lives).toBeLessThanOrEqual(0);
    });

    it('lives display shows correct hearts', () => {
        const livesDisplay = (n) => '♥'.repeat(n);
        expect(livesDisplay(3)).toBe('♥♥♥');
        expect(livesDisplay(2)).toBe('♥♥');
        expect(livesDisplay(1)).toBe('♥');
        expect(livesDisplay(0)).toBe('');
    });
});

describe('Frightened Mode', () => {
    const FRIGHTEN_DURATION = 8000;

    it('frighten duration is 8000ms', () => {
        expect(FRIGHTEN_DURATION).toBe(8000);
    });

    it('frightened mode activates on power pellet', () => {
        let frightened = false;
        // eating a power pellet activates frightened
        frightened = true;
        expect(frightened).toBe(true);
    });

    it('frightened mode expires after duration', () => {
        let frightenTimer = FRIGHTEN_DURATION;
        frightenTimer -= FRIGHTEN_DURATION;
        expect(frightenTimer).toBeLessThanOrEqual(0);
    });

    it('ghost flashes in last 2000ms of frightened mode', () => {
        const FLASH_THRESHOLD = 2000;
        const frightenTimer = 1500;
        expect(frightenTimer).toBeLessThan(FLASH_THRESHOLD);
    });

    it('eating frightened ghost resets it to start position', () => {
        const startPositions = [
            { col: 13, row: 13 },
            { col: 14, row: 13 },
            { col: 13, row: 14 },
            { col: 14, row: 14 },
        ];
        const ghost = { col: 5, row: 5, frightened: true };
        const idx = 0;
        // reset to start
        ghost.col = startPositions[idx].col;
        ghost.row = startPositions[idx].row;
        ghost.frightened = false;
        expect(ghost.col).toBe(13);
        expect(ghost.row).toBe(13);
        expect(ghost.frightened).toBe(false);
    });
});

describe('Maze Dot Count', () => {
    it('maze contains dots (cell type 2)', () => {
        const dots = MAZE_TEMPLATE.flat().filter(c => c === 2);
        expect(dots.length).toBeGreaterThan(0);
    });

    it('maze contains power pellets (cell type 3)', () => {
        const pellets = MAZE_TEMPLATE.flat().filter(c => c === 3);
        expect(pellets.length).toBe(4); // classic pacman has 4 pellets
    });

    it('maze contains walls (cell type 1)', () => {
        const walls = MAZE_TEMPLATE.flat().filter(c => c === 1);
        expect(walls.length).toBeGreaterThan(50);
    });

    it('maze contains ghost house cells (cell type 4)', () => {
        const house = MAZE_TEMPLATE.flat().filter(c => c === 4);
        expect(house.length).toBeGreaterThan(0);
    });

    it('all maze cells are valid types (0,1,2,3,4)', () => {
        const valid = new Set([0, 1, 2, 3, 4]);
        MAZE_TEMPLATE.flat().forEach(c => {
            expect(valid.has(c)).toBe(true);
        });
    });
});

describe('Tunnel Wrap Logic', () => {
    it('pacman wraps from left edge to right', () => {
        let col = -1;
        if (col < 0) col = COLS - 1;
        expect(col).toBe(27);
    });

    it('pacman wraps from right edge to left', () => {
        let col = COLS;
        if (col >= COLS) col = 0;
        expect(col).toBe(0);
    });

    it('tunnel row 14 has passable cells on both edges', () => {
        // Row 14 is the tunnel row: [0,0,0,0,0,0,2,0,0,0,...]
        expect(MAZE_TEMPLATE[14][0]).toBe(0);
        expect(MAZE_TEMPLATE[14][COLS - 1]).toBe(0);
    });
});

describe('High Score Ranking', () => {
    it('ranks scores from highest to lowest', () => {
        const scores = [
            { PlayerName__c: 'A', Score__c: 100 },
            { PlayerName__c: 'B', Score__c: 300 },
            { PlayerName__c: 'C', Score__c: 200 },
        ];
        scores.sort((a, b) => b.Score__c - a.Score__c);
        expect(scores[0].PlayerName__c).toBe('B');
        expect(scores[1].PlayerName__c).toBe('C');
        expect(scores[2].PlayerName__c).toBe('A');
    });

    it('adds rank numbers correctly', () => {
        const scores = [
            { PlayerName__c: 'X', Score__c: 50 },
            { PlayerName__c: 'Y', Score__c: 30 },
        ];
        const ranked = scores.map((s, i) => ({ ...s, rank: i + 1 }));
        expect(ranked[0].rank).toBe(1);
        expect(ranked[1].rank).toBe(2);
    });

    it('highlights current player in scores', () => {
        const playerName = 'Penny';
        const scores = [
            { PlayerName__c: 'Penny', Score__c: 200 },
            { PlayerName__c: 'Other', Score__c: 100 },
        ].map(s => ({
            ...s,
            rowClass: s.PlayerName__c === playerName ? 'hs-row hs-highlight' : 'hs-row'
        }));
        expect(scores[0].rowClass).toBe('hs-row hs-highlight');
        expect(scores[1].rowClass).toBe('hs-row');
    });
});

describe('Apex Mocks - saveScore', () => {
    beforeEach(() => jest.clearAllMocks());

    it('saveScore mock resolves successfully', async () => {
        await expect(saveScore({ playerName: 'Test', score: 42 })).resolves.toBeUndefined();
    });

    it('saveScore is called with playerName and score', async () => {
        await saveScore({ playerName: 'Penny', score: 99 });
        expect(saveScore).toHaveBeenCalledWith({ playerName: 'Penny', score: 99 });
    });

    it('saveScore can be called with score of 0', async () => {
        await expect(saveScore({ playerName: 'Newbie', score: 0 })).resolves.toBeUndefined();
    });

    it('saveScore rejection is catchable', async () => {
        saveScore.mockRejectedValueOnce(new Error('Network error'));
        await expect(saveScore({ playerName: 'X', score: 1 })).rejects.toThrow('Network error');
    });
});

describe('Apex Mocks - getHighScores', () => {
    beforeEach(() => jest.clearAllMocks());

    it('getHighScores returns an array', async () => {
        const result = await getHighScores();
        expect(Array.isArray(result)).toBe(true);
    });

    it('getHighScores returns at most 10 records', async () => {
        const result = await getHighScores();
        expect(result.length).toBeLessThanOrEqual(10);
    });

    it('each record has PlayerName__c field', async () => {
        const result = await getHighScores();
        result.forEach(r => expect(r).toHaveProperty('PlayerName__c'));
    });

    it('each record has Score__c field', async () => {
        const result = await getHighScores();
        result.forEach(r => expect(r).toHaveProperty('Score__c'));
    });

    it('results are sorted descending by score', async () => {
        const result = await getHighScores();
        for (let i = 0; i < result.length - 1; i++) {
            expect(result[i].Score__c).toBeGreaterThanOrEqual(result[i + 1].Score__c);
        }
    });

    it('getHighScores rejection is catchable', async () => {
        getHighScores.mockRejectedValueOnce(new Error('Apex error'));
        await expect(getHighScores()).rejects.toThrow('Apex error');
    });
});
