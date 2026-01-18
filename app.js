/**
 * MRI DEFENDER: ULTIMATE ZONE IV CLINICAL SIMULATOR
 * Professional Grade: Procedural Destruction, Incident Logging, CRT Engine
 * Optimized for Mobile (S21/Acode) & Desktop
 */

// --- 1. GLOBAL CONSTANTS & CONFIG ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');

const CONFIG = {
    PATIENT_ZONE_HEIGHT: 150,
    INITIAL_SPAWN_RATE: 1500,
    MIN_SPAWN_RATE: 350,
    PHYSICS: {
        GRAVITY_MIN: 1.8,
        FIELD_INC: 0.25,
        TERMINAL_VELOCITY: 14,
        PARTICLE_DECAY: 0.03
    },
    VIBRATION: {
        SHATTER: 35,
        QUENCH: [100, 50, 100, 50, 400]
    },
    COLORS: {
        HUD_GREEN: '#00ff41',
        HUD_DIM: 'rgba(0, 255, 65, 0.2)',
        ALARM_RED: '#ff3131',
        HELIUM_QUENCH: '#e0f7ff',
        CHASSIS: '#000804'
    }
};

// Radiology Hazard Database (Lore-Accurate)
const THREAT_DB = {
    'OXYGEN_TANK': { 
        label: 'O2 CYLINDER', color: '#ff3131', w: 22, h: 55, hp: 3, pts: 150, 
        lore: "Non-MR Safe tanks become deadly projectiles." 
    },
    'SCISSORS': { 
        label: 'SURGICAL SHEARS', color: '#c0c0c0', w: 10, h: 28, hp: 1, pts: 75, 
        lore: "Small ferrous items reach lethal speeds instantly." 
    },
    'WHEELCHAIR': { 
        label: 'STEEL CHAIR', color: '#4d4d4d', w: 65, h: 60, hp: 6, pts: 500, 
        lore: "Massive ferrous load; fatal collision risk." 
    },
    'IV_POLE': { 
        label: 'IV STAND', color: '#e6e6e6', w: 8, h: 85, hp: 2, pts: 100, 
        lore: "Magnetic torque causes violent swinging." 
    },
    'FLOOR_BUFFER': { 
        label: 'INDUSTRIAL BUFFER', color: '#ffaa00', w: 50, h: 45, hp: 4, pts: 250, 
        lore: "Cleaning equipment is a major Zone IV violation." 
    }
};

// --- 2. GAME STATE ---
let state = {
    mode: 'START',
    score: 0,
    level: 1,
    frameCount: 0,
    items: [],
    particles: [],
    lastSpawn: 0,
    quenchAlpha: 0,
    incidentLog: new Set()
};

// --- 3. CORE CLASSES ---

class Particle {
    constructor(x, y, color, velScale) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = Math.random() * 3 + 1;
        this.vx = (Math.random() - 0.5) * velScale;
        this.vy = (Math.random() - 0.5) * velScale;
        this.alpha = 1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= CONFIG.PHYSICS.PARTICLE_DECAY;
    }

    draw() {
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.globalAlpha = 1;
    }
}

class Projectile {
    constructor() {
        const keys = Object.keys(THREAT_DB);
        const data = THREAT_DB[keys[Math.floor(Math.random() * keys.length)]];
        Object.assign(this, data);

        this.x = Math.random() * (canvas.width - 100) + 50;
        this.y = -100;
        this.rotation = Math.random() * Math.PI;
        this.rotV = (Math.random() - 0.5) * 0.12;
        this.currHp = this.hp;
        this.cracks = [];
        this.shake = 0;
    }

    update() {
        const speed = Math.min(
            CONFIG.PHYSICS.GRAVITY_MIN + (state.level * CONFIG.PHYSICS.FIELD_INC), 
            CONFIG.PHYSICS.TERMINAL_VELOCITY
        );
        this.y += speed;
        this.rotation += this.rotV;
        if (this.shake > 0) this.shake--;
    }

    draw() {
        ctx.save();
        let shakeX = (Math.random() - 0.5) * this.shake;
        ctx.translate(this.x + shakeX, this.y);
        ctx.rotate(this.rotation);

        // Magnetic Aura Glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        
        // Render Object Body
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.w/2, -this.h/2, this.w, this.h);

        // Fracture Mechanics (Cracks)
        ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
        ctx.lineWidth = 1.5;
        this.cracks.forEach(c => {
            ctx.beginPath();
            ctx.moveTo(c.x1, c.y1);
            ctx.lineTo(c.x2, c.y2);
            ctx.stroke();
        });

        ctx.restore();

        // Clinical HUD Label
        ctx.fillStyle = CONFIG.COLORS.HUD_GREEN;
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(this.label, this.x, this.y + this.h + 15);
    }

    onHit() {
        this.currHp--;
        this.shake = 10;
        this.cracks.push({
            x1: (Math.random() - 0.5) * this.w,
            y1: (Math.random() - 0.5) * this.h,
            x2: (Math.random() - 0.5) * this.w,
            y2: (Math.random() - 0.5) * this.h
        });
    }
}

// --- 4. ENGINE LOGIC ---

function handleInput(x, y) {
    if (state.mode !== 'PLAYING') {
        startNewSession();
        return;
    }

    for (let i = state.items.length - 1; i >= 0; i--) {
        const p = state.items[i];
        if (Math.hypot(p.x - x, p.y - y) < 75) {
            p.onHit();
            if (navigator.vibrate) navigator.vibrate(CONFIG.VIBRATION.SHATTER);

            if (p.currHp <= 0) {
                state.score += p.pts;
                state.incidentLog.add(p.label);
                createExplosion(p.x, p.y, p.color, 40, 15);
                state.items.splice(i, 1);
                updateScoreUI();
            } else {
                createExplosion(p.x, p.y, "#ffffff", 10, 6);
            }
            break;
        }
    }
}

function createExplosion(x, y, color, n, v) {
    for (let i = 0; i < n; i++) {
        state.particles.push(new Particle(x, y, color, v));
    }
}

function updateScoreUI() {
    scoreEl.innerText = state.score.toString().padStart(6, '0');
    state.level = Math.floor(state.score / 2000) + 1;
}

function startNewSession() {
    state = {
        ...state,
        mode: 'PLAYING',
        score: 0,
        level: 1,
        items: [],
        particles: [],
        quenchAlpha: 0,
        incidentLog: new Set()
    };
    updateScoreUI();
}

// --- 5. RENDER SYSTEM ---

function draw() {
    // CRT Ghosting Background
    ctx.fillStyle = 'rgba(0, 10, 5, 0.4)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (state.mode === 'PLAYING') {
        const spawnRate = Math.max(CONFIG.MIN_SPAWN_RATE, CONFIG.INITIAL_SPAWN_RATE - (state.level * 180));
        if (Date.now() - state.lastSpawn > spawnRate) {
            state.items.push(new Projectile());
            state.lastSpawn = Date.now();
        }

        state.items.forEach(it => {
            it.update();
            it.draw();
            if (it.y > canvas.height - CONFIG.PATIENT_ZONE_HEIGHT) triggerQuench();
        });

        state.particles.forEach((p, i) => {
            p.update();
            p.draw();
            if (p.alpha <= 0) state.particles.splice(i, 1);
        });

        renderHUD();
    } else if (state.mode === 'QUENCH') {
        renderQuenchSummary();
    } else {
        renderStartMenu();
    }

    state.frameCount++;
    requestAnimationFrame(draw);
}

function renderHUD() {
    const yB = canvas.height - CONFIG.PATIENT_ZONE_HEIGHT;
    
    // Safety Gantry Outline
    ctx.strokeStyle = CONFIG.COLORS.HUD_GREEN;
    ctx.lineWidth = 2;
    ctx.strokeRect(10, yB, canvas.width - 20, CONFIG.PATIENT_ZONE_HEIGHT - 10);
    
    // Procedural Scanline
    ctx.fillStyle = CONFIG.COLORS.HUD_DIM;
    const scanY = (state.frameCount * 2) % (CONFIG.PATIENT_ZONE_HEIGHT - 20);
    ctx.fillRect(10, yB + scanY, canvas.width - 20, 2);

    // Warning Text
    ctx.fillStyle = CONFIG.COLORS.ALARM_RED;
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText("DANGER: ZONE IV - ISOCENTER ACTIVE", canvas.width/2, yB + 30);
    
    ctx.fillStyle = CONFIG.COLORS.HUD_GREEN;
    ctx.font = '10px monospace';
    ctx.fillText(`STATIC FIELD: ${1.5 + (state.level * 0.5)} TESLA`, canvas.width/2, yB + 50);
}

function triggerQuench() {
    state.mode = 'QUENCH';
    if (navigator.vibrate) navigator.vibrate(CONFIG.VIBRATION.QUENCH);
}

function renderQuenchSummary() {
    state.quenchAlpha = Math.min(state.quenchAlpha + 0.05, 0.95);
    ctx.fillStyle = `rgba(224, 247, 255, ${state.quenchAlpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.textAlign = 'center';
    ctx.fillStyle = CONFIG.COLORS.ALARM_RED;
    ctx.font = 'bold 26px monospace';
    ctx.fillText("MAGNET QUENCH", canvas.width/2, 70);
    
    ctx.fillStyle = "#000";
    ctx.font = 'bold 14px monospace';
    ctx.fillText("SAFETY DEBRIEF:", canvas.width/2, 110);
    
    let y = 150;
    state.incidentLog.forEach(label => {
        // Find matching lore in DB
        const entry = Object.values(THREAT_DB).find(e => e.label === label);
        ctx.fillStyle = "#222";
        ctx.font = 'bold 11px monospace';
        ctx.fillText(`• ${label} NEUTRALIZED`, canvas.width/2, y);
        ctx.fillStyle = "#555";
        ctx.font = 'italic 10px monospace';
        ctx.fillText(entry.lore, canvas.width/2, y + 15);
        y += 45;
    });

    if (state.incidentLog.size === 0) {
        ctx.fillText("System Failure: No Hazards Managed", canvas.width/2, 200);
    }

    ctx.fillStyle = CONFIG.COLORS.ALARM_RED;
    ctx.font = 'bold 12px monospace';
    ctx.fillText("TAP SCREEN TO RE-ENERGIZE MAGNET", canvas.width/2, canvas.height - 50);
}

function renderStartMenu() {
    ctx.fillStyle = CONFIG.COLORS.HUD_GREEN;
    ctx.textAlign = 'center';
    ctx.font = 'bold 24px monospace';
    ctx.fillText("MRI SAFETY TRAINER", canvas.width/2, canvas.height/2 - 20);
    ctx.font = '12px monospace';
    ctx.fillText("NEUTRALIZE PROJECTILES BEFORE IMPACT", canvas.width/2, canvas.height/2 + 20);
    ctx.font = 'bold 11px monospace';
    ctx.fillText("TAP TO INITIALIZE FIELD", canvas.width/2, canvas.height/2 + 60);
}

// --- 6. INITIALIZATION ---

function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleInput(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: false });

    canvas.addEventListener('mousedown', (e) => {
        handleInput(e.clientX, e.clientY);
    });

    draw();
}

init();
