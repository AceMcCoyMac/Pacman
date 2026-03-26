import { LightningElement, track } from 'lwc';
import saveScore from '@salesforce/apex/PacmanScoreController.saveScore';
import getHighScores from '@salesforce/apex/PacmanScoreController.getHighScores';

// ─── Maze Layout ────────────────────────────────────────────────────────────
// 0 = empty, 1 = wall, 2 = dot, 3 = power pellet, 4 = ghost house
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

const COLS = 28;
const ROWS = 31;
const CELL = 20; // px per cell

// Directions
const DIR = { UP: 0, DOWN: 1, LEFT: 2, RIGHT: 3 };
const VECTORS = [
    { x: 0, y: -1 },  // UP
    { x: 0, y: 1 },   // DOWN
    { x: -1, y: 0 },  // LEFT
    { x: 1, y: 0 },   // RIGHT
];

// Ghost colors
const GHOST_COLORS = ['#FF0000', '#FFB8FF', '#00FFFF', '#FFB852'];
const FRIGHTENED_COLOR = '#2121DE';
const FRIGHTENED_FLASH = '#FFFFFF';

const GHOST_START_POSITIONS = [
    { col: 13, row: 13 },
    { col: 14, row: 13 },
    { col: 13, row: 14 },
    { col: 14, row: 14 },
];

const PACMAN_START = { col: 14, row: 22 };
const FRIGHTEN_DURATION = 8000; // ms

export default class Pacman extends LightningElement {
    // ── Reactive state ──
    @track showStartScreen = true;
    @track showGameScreen = false;
    @track showGameOverScreen = false;
    @track playerName = '';
    @track score = 0;
    @track lives = 3;
    @track isPaused = false;
    @track isSavingScore = false;
    @track scoreSaved = false;
    @track saveError = false;
    @track highScores = [];
    @track loadingHighScores = false;

    get isNameEmpty() {
        return !this.playerName || this.playerName.trim() === '';
    }

    get pauseButtonLabel() {
        return this.isPaused ? 'Resume' : 'Pause';
    }

    get livesDisplay() {
        return '♥'.repeat(this.lives);
    }

    // ── Game internals ──
    _canvas = null;
    _ctx = null;
    _maze = null;
    _totalDots = 0;
    _dotsEaten = 0;

    _pacman = null;
    _ghosts = [];
    _animFrameId = null;
    _lastTime = 0;
    _pacmanMoveTimer = 0;
    _ghostMoveTimer = 0;
    _pacmanSpeed = 200;  // ms per cell
    _ghostSpeed = 250;
    _frightenTimer = 0;
    _isFrightened = false;
    _flashTimer = 0;

    _keysDown = {};
    _boundKeyDown = null;
    _boundKeyUp = null;

    // ─────────────────────────────────────────────────────────────────────────
    // Lifecycle
    // ─────────────────────────────────────────────────────────────────────────

    connectedCallback() {
        this._boundKeyDown = this._handleKeyDown.bind(this);
        this._boundKeyUp = this._handleKeyUp.bind(this);
        window.addEventListener('keydown', this._boundKeyDown);
        window.addEventListener('keyup', this._boundKeyUp);
    }

    disconnectedCallback() {
        window.removeEventListener('keydown', this._boundKeyDown);
        window.removeEventListener('keyup', this._boundKeyUp);
        if (this._animFrameId) cancelAnimationFrame(this._animFrameId);
    }

    renderedCallback() {
        if (this.showGameScreen && !this._canvas) {
            this._canvas = this.refs.gameCanvas;
            if (this._canvas) {
                this._ctx = this._canvas.getContext('2d');
                this._canvas.focus();
                this._initGame();
                this._loop(0);
            }
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Event Handlers
    // ─────────────────────────────────────────────────────────────────────────

    handleNameChange(e) {
        this.playerName = e.target.value;
    }

    startGame() {
        if (this.isNameEmpty) return;
        this.showStartScreen = false;
        this.showGameScreen = true;
        this._canvas = null; // Will be picked up in renderedCallback
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        if (!this.isPaused) {
            this._lastTime = 0;
            this._loop(0);
        }
    }

    resetGame() {
        this.showGameOverScreen = false;
        this.showStartScreen = false;
        this.showGameScreen = true;
        this.score = 0;
        this.lives = 3;
        this.isPaused = false;
        this.isSavingScore = false;
        this.scoreSaved = false;
        this.saveError = false;
        this.highScores = [];
        this.loadingHighScores = false;
        this._canvas = null;
    }

    _handleKeyDown(e) {
        this._keysDown[e.code] = true;
        if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) {
            e.preventDefault();
        }
        if (e.code === 'KeyP' && this.showGameScreen) {
            this.togglePause();
        }
        // Update nextDir immediately on keypress — don't wait for next move tick
        if (this.showGameScreen && this._pacman) {
            if (e.code === 'ArrowUp')    this._pacman.nextDir = DIR.UP;
            if (e.code === 'ArrowDown')  this._pacman.nextDir = DIR.DOWN;
            if (e.code === 'ArrowLeft')  this._pacman.nextDir = DIR.LEFT;
            if (e.code === 'ArrowRight') this._pacman.nextDir = DIR.RIGHT;
        }
    }

    _handleKeyUp(e) {
        delete this._keysDown[e.code];
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Game Initialization
    // ─────────────────────────────────────────────────────────────────────────

    _initGame() {
        // Deep copy maze
        this._maze = MAZE_TEMPLATE.map(row => [...row]);

        // Count dots
        this._totalDots = 0;
        this._dotsEaten = 0;
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (this._maze[r][c] === 2 || this._maze[r][c] === 3) {
                    this._totalDots++;
                }
            }
        }

        // Pacman
        this._pacman = {
            col: PACMAN_START.col,
            row: PACMAN_START.row,
            x: PACMAN_START.col * CELL + CELL / 2,
            y: PACMAN_START.row * CELL + CELL / 2,
            dir: DIR.LEFT,
            nextDir: DIR.LEFT,
            mouthAngle: 0.25,
            mouthDir: 1,
        };

        // Ghosts
        this._ghosts = GHOST_START_POSITIONS.map((pos, i) => ({
            col: pos.col,
            row: pos.row,
            x: pos.col * CELL + CELL / 2,
            y: pos.row * CELL + CELL / 2,
            dir: DIR.UP,
            color: GHOST_COLORS[i],
            frightened: false,
            exitDelay: i * 2000,
            exited: i === 0,
        }));

        this._isFrightened = false;
        this._frightenTimer = 0;
        this._pacmanMoveTimer = 0;
        this._ghostMoveTimer = 0;
        this._lastTime = 0;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Game Loop
    // ─────────────────────────────────────────────────────────────────────────

    _loop(timestamp) {
        if (!this.showGameScreen || this.isPaused) return;

        if (this._lastTime === 0) this._lastTime = timestamp;
        const dt = Math.min(timestamp - this._lastTime, 100);
        this._lastTime = timestamp;

        this._update(dt);
        this._draw();

        this._animFrameId = requestAnimationFrame((ts) => this._loop(ts));
    }

    _update(dt) {
        // Frightened timer
        if (this._isFrightened) {
            this._frightenTimer -= dt;
            this._flashTimer += dt;
            if (this._frightenTimer <= 0) {
                this._isFrightened = false;
                this._ghosts.forEach(g => g.frightened = false);
            }
        }

        // Ghost exit delays
        this._ghosts.forEach(g => {
            if (!g.exited) {
                g.exitDelay -= dt;
                if (g.exitDelay <= 0) g.exited = true;
            }
        });

        // Move pacman
        this._pacmanMoveTimer += dt;
        if (this._pacmanMoveTimer >= this._pacmanSpeed) {
            this._pacmanMoveTimer = 0;
            this._movePacman();
        }

        // Move ghosts
        this._ghostMoveTimer += dt;
        const ghostInterval = this._isFrightened ? this._ghostSpeed * 2 : this._ghostSpeed;
        if (this._ghostMoveTimer >= ghostInterval) {
            this._ghostMoveTimer = 0;
            this._ghosts.forEach(g => { if (g.exited) this._moveGhost(g); });
        }

        // Mouth animation
        this._pacman.mouthAngle += 0.05 * this._pacman.mouthDir;
        if (this._pacman.mouthAngle > 0.25) { this._pacman.mouthAngle = 0.25; this._pacman.mouthDir = -1; }
        if (this._pacman.mouthAngle < 0.01) { this._pacman.mouthAngle = 0.01; this._pacman.mouthDir = 1; }

        // Collision: ghost vs pacman
        this._checkGhostCollision();

        // Win check
        if (this._dotsEaten >= this._totalDots) {
            this._gameOver();
        }
    }

    _movePacman() {
        const p = this._pacman;

        // Try to turn in requested direction
        const nextDir = p.nextDir;
        const nextVec = VECTORS[nextDir];
        const nextCol = p.col + nextVec.x;
        const nextRow = p.row + nextVec.y;

        if (this._isPassable(nextCol, nextRow)) {
            p.dir = nextDir;
        }

        // Move in current direction
        const vec = VECTORS[p.dir];
        const newCol = p.col + vec.x;
        const newRow = p.row + vec.y;

        if (!this._isPassable(newCol, newRow)) return;

        // Tunnel wrap
        let finalCol = newCol;
        if (finalCol < 0) finalCol = COLS - 1;
        if (finalCol >= COLS) finalCol = 0;

        p.col = finalCol;
        p.row = newRow;
        p.x = p.col * CELL + CELL / 2;
        p.y = p.row * CELL + CELL / 2;

        // Eat dots
        const cell = this._maze[p.row][p.col];
        if (cell === 2) {
            this._maze[p.row][p.col] = 0;
            this.score += 1;
            this._dotsEaten++;
        } else if (cell === 3) {
            this._maze[p.row][p.col] = 0;
            this.score += 5;
            this._dotsEaten++;
            this._activateFrighten();
        }
    }

    _activateFrighten() {
        this._isFrightened = true;
        this._frightenTimer = FRIGHTEN_DURATION;
        this._flashTimer = 0;
        this._ghosts.forEach(g => { g.frightened = true; });
    }

    _moveGhost(ghost) {
        const possible = [];

        // Don't reverse unless no other option
        for (let d = 0; d < 4; d++) {
            const reverse = (ghost.dir === DIR.UP && d === DIR.DOWN) ||
                            (ghost.dir === DIR.DOWN && d === DIR.UP) ||
                            (ghost.dir === DIR.LEFT && d === DIR.RIGHT) ||
                            (ghost.dir === DIR.RIGHT && d === DIR.LEFT);
            if (reverse) continue;

            const v = VECTORS[d];
            const nc = ghost.col + v.x;
            const nr = ghost.row + v.y;
            if (this._isPassableForGhost(nc, nr)) {
                possible.push(d);
            }
        }

        if (possible.length === 0) {
            // Try reverse
            for (let d = 0; d < 4; d++) {
                const v = VECTORS[d];
                const nc = ghost.col + v.x;
                const nr = ghost.row + v.y;
                if (this._isPassableForGhost(nc, nr)) {
                    possible.push(d);
                    break;
                }
            }
        }

        if (possible.length === 0) return;

        let chosen;

        if (ghost.frightened) {
            // Random when frightened
            chosen = possible[Math.floor(Math.random() * possible.length)];
        } else {
            // Chase pacman: pick direction that minimizes distance
            let bestDist = Infinity;
            let bestDir = possible[0];
            possible.forEach(d => {
                const v = VECTORS[d];
                const nc = ghost.col + v.x;
                const nr = ghost.row + v.y;
                const dist = Math.abs(nc - this._pacman.col) + Math.abs(nr - this._pacman.row);
                if (dist < bestDist) {
                    bestDist = dist;
                    bestDir = d;
                }
            });
            chosen = bestDir;
        }

        ghost.dir = chosen;
        const v = VECTORS[chosen];
        ghost.col += v.x;
        ghost.row += v.y;
        ghost.x = ghost.col * CELL + CELL / 2;
        ghost.y = ghost.row * CELL + CELL / 2;
    }

    _checkGhostCollision() {
        const p = this._pacman;
        this._ghosts.forEach(g => {
            if (!g.exited) return;
            if (g.col === p.col && g.row === p.row) {
                if (g.frightened) {
                    // Eat ghost — send back to house
                    const idx = this._ghosts.indexOf(g);
                    g.frightened = false;
                    g.col = GHOST_START_POSITIONS[idx].col;
                    g.row = GHOST_START_POSITIONS[idx].row;
                    g.x = g.col * CELL + CELL / 2;
                    g.y = g.row * CELL + CELL / 2;
                    this.score += 10;
                } else {
                    // Lose a life
                    this.lives -= 1;
                    if (this.lives <= 0) {
                        this._gameOver();
                    } else {
                        this._resetPositions();
                    }
                }
            }
        });
    }

    _resetPositions() {
        this._pacman.col = PACMAN_START.col;
        this._pacman.row = PACMAN_START.row;
        this._pacman.x = PACMAN_START.col * CELL + CELL / 2;
        this._pacman.y = PACMAN_START.row * CELL + CELL / 2;
        this._pacman.dir = DIR.LEFT;
        this._pacman.nextDir = DIR.LEFT;

        this._ghosts.forEach((g, i) => {
            g.col = GHOST_START_POSITIONS[i].col;
            g.row = GHOST_START_POSITIONS[i].row;
            g.x = g.col * CELL + CELL / 2;
            g.y = g.row * CELL + CELL / 2;
            g.frightened = false;
        });
        this._isFrightened = false;
    }

    _gameOver() {
        if (this._animFrameId) cancelAnimationFrame(this._animFrameId);
        this._animFrameId = null;
        this.showGameScreen = false;
        this.showGameOverScreen = true;
        this._canvas = null;
        this._ctx = null;

        // Save score then fetch high scores
        this.isSavingScore = true;
        this.loadingHighScores = true;
        this.highScores = [];
        saveScore({ playerName: this.playerName.trim(), score: this.score })
            .then(() => {
                this.isSavingScore = false;
                this.scoreSaved = true;
                return getHighScores();
            })
            .then((results) => {
                this.highScores = (results || []).map((r, i) => ({
                    ...r,
                    rank: i + 1,
                    rowClass: r.PlayerName__c === this.playerName.trim() ? 'hs-row hs-highlight' : 'hs-row'
                }));
                this.loadingHighScores = false;
            })
            .catch(() => {
                this.isSavingScore = false;
                this.saveError = true;
                this.loadingHighScores = false;
            });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    _isPassable(col, row) {
        if (row < 0 || row >= ROWS) return false;
        if (col < 0 || col >= COLS) return true; // tunnel
        const cell = this._maze[row][col];
        return cell !== 1 && cell !== 4;
    }

    _isPassableForGhost(col, row) {
        if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return false;
        const cell = this._maze[row][col];
        return cell !== 1;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Drawing
    // ─────────────────────────────────────────────────────────────────────────

    _draw() {
        if (!this._ctx) return;
        const ctx = this._ctx;
        const W = COLS * CELL;
        const H = ROWS * CELL;

        // Clear
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, W, H);

        // Maze
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const cell = this._maze[r][c];
                const x = c * CELL;
                const y = r * CELL;

                if (cell === 1) {
                    ctx.fillStyle = '#1a1aff';
                    ctx.fillRect(x, y, CELL, CELL);
                    // Inner wall highlight
                    ctx.fillStyle = '#0000cc';
                    ctx.fillRect(x + 2, y + 2, CELL - 4, CELL - 4);
                } else if (cell === 2) {
                    ctx.fillStyle = '#ffff99';
                    ctx.beginPath();
                    ctx.arc(x + CELL / 2, y + CELL / 2, 2, 0, Math.PI * 2);
                    ctx.fill();
                } else if (cell === 3) {
                    // Power pellet - pulsing
                    const pulse = (Math.sin(Date.now() / 200) + 1) / 2;
                    ctx.fillStyle = `rgba(255, 255, 100, ${0.5 + pulse * 0.5})`;
                    ctx.beginPath();
                    ctx.arc(x + CELL / 2, y + CELL / 2, 4 + pulse * 2, 0, Math.PI * 2);
                    ctx.fill();
                } else if (cell === 4) {
                    // Ghost house interior
                    ctx.fillStyle = '#111';
                    ctx.fillRect(x, y, CELL, CELL);
                }
            }
        }

        // Pacman
        this._drawPacman(ctx);

        // Ghosts
        this._ghosts.forEach(g => {
            if (g.exited) this._drawGhost(ctx, g);
        });
    }

    _drawPacman(ctx) {
        const p = this._pacman;
        const angle = p.mouthAngle * Math.PI;

        // Rotation based on direction
        const rotations = { [DIR.RIGHT]: 0, [DIR.DOWN]: 0.5, [DIR.LEFT]: 1, [DIR.UP]: 1.5 };
        const rot = rotations[p.dir] * Math.PI;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(rot);

        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, CELL / 2 - 1, angle, Math.PI * 2 - angle);
        ctx.closePath();
        ctx.fill();

        // Eye
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(3, -6, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    _drawGhost(ctx, ghost) {
        const x = ghost.x;
        const y = ghost.y;
        const r = CELL / 2 - 2;

        let color = ghost.color;
        if (ghost.frightened) {
            if (this._frightenTimer < 2000) {
                // Flash
                color = Math.floor(this._flashTimer / 250) % 2 === 0 ? FRIGHTENED_FLASH : FRIGHTENED_COLOR;
            } else {
                color = FRIGHTENED_COLOR;
            }
        }

        ctx.fillStyle = color;
        ctx.beginPath();
        // Top arc
        ctx.arc(x, y - 2, r, Math.PI, 0);
        // Right side down
        ctx.lineTo(x + r, y + r);
        // Wavy bottom
        const waves = 4;
        const waveW = (r * 2) / waves;
        for (let w = 0; w < waves; w++) {
            const wx = (x + r) - (w + 1) * waveW;
            ctx.quadraticCurveTo(wx + waveW * 0.75, y + r + 5, wx + waveW * 0.5, y + r);
            ctx.quadraticCurveTo(wx + waveW * 0.25, y + r - 5, wx, y + r);
        }
        ctx.closePath();
        ctx.fill();

        // Eyes
        if (!ghost.frightened) {
            // White part
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.ellipse(x - 3, y - 4, 3, 4, 0, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.ellipse(x + 4, y - 4, 3, 4, 0, 0, Math.PI * 2); ctx.fill();
            // Pupils
            ctx.fillStyle = '#00f';
            ctx.beginPath(); ctx.arc(x - 2, y - 3, 2, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + 5, y - 3, 2, 0, Math.PI * 2); ctx.fill();
        } else {
            // Scared eyes
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(x - 5, y - 2); ctx.lineTo(x - 3, y - 4); ctx.lineTo(x - 1, y - 2);
            ctx.moveTo(x + 1, y - 2); ctx.lineTo(x + 3, y - 4); ctx.lineTo(x + 5, y - 2);
            ctx.stroke();
        }
    }
}