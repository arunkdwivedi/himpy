// ═══════════════════════════════════════════════
//  PYTHON HERO — script.js
// ═══════════════════════════════════════════════

// ── Canvas drawing bridge ──────────────────────
// We expose a simple draw API to Python via js globals
// Python calls: draw_rect(x,y,w,h,color), draw_circle(x,y,r,color), etc.
const pyCanvas = document.getElementById('py-canvas');
const ctx2d = pyCanvas.getContext('2d');
let hintTimer = null;
function clearCanvas() { ctx2d.clearRect(0, 0, pyCanvas.width, pyCanvas.height); }

// JS functions that Python can call via js module
window._pyDrawRect  = (x,y,w,h,color) => { ctx2d.fillStyle=color; ctx2d.fillRect(x,y,w,h); };
window._pyDrawCircle= (x,y,r,color)   => { ctx2d.fillStyle=color; ctx2d.beginPath(); ctx2d.arc(x,y,r,0,Math.PI*2); ctx2d.fill(); };
window._pyDrawLine  = (x1,y1,x2,y2,color,width) => {
    ctx2d.strokeStyle=color; ctx2d.lineWidth=width||2;
    ctx2d.beginPath(); ctx2d.moveTo(x1,y1); ctx2d.lineTo(x2,y2); ctx2d.stroke();
};
window._pyDrawText  = (text,x,y,color,size) => {
    ctx2d.fillStyle=color; ctx2d.font=`bold ${size||18}px sans-serif`;
    ctx2d.fillText(text,x,y);
};
window._pySetBg     = (color) => { ctx2d.fillStyle=color; ctx2d.fillRect(0,0,pyCanvas.width,pyCanvas.height); };
window._pyClearCanvas = clearCanvas;

// ── Python helper code injected before each run ──
const CANVAS_HELPERS = `
from js import _pyDrawRect, _pyDrawCircle, _pyDrawLine, _pyDrawText, _pySetBg, _pyClearCanvas

def clear_screen():
    _pyClearCanvas()

def set_background(color="white"):
    _pySetBg(color)

def draw_rect(x, y, width, height, color="blue"):
    _pyDrawRect(x, y, width, height, color)

def draw_circle(x, y, radius, color="red"):
    _pyDrawCircle(x, y, radius, color)

def draw_line(x1, y1, x2, y2, color="black", thickness=2):
    _pyDrawLine(x1, y1, x2, y2, color, thickness)

def draw_text(text, x, y, color="black", size=18):
    _pyDrawText(str(text), x, y, color, size)
`;

// ── Mission Database ───────────────────────────
const missions = [
    // ─── WORLD 1: THE BASICS ─────────────────────
    {
        id: 1, world: 1,
        title: "Mission 1: First Contact",
        worldLabel: "World 1",
        xp: 50,
        reward: "🛸",
        desc: "Welcome, space cadet! Your spaceship computer is silent. Wake it up by making it say something. In Python, <b>print( )</b> sends a message to your screen.",
        goal: "🎯 Goal: Make Python print your name. Change the message inside the quotes!",
        startCode: `# Your first Python command!
# Change the message below to YOUR name
print("Hello, I am ...")`,
        hint: "Click inside the quotes and type your name, like: print(\"Hello, I am Himanshu!\")",
        check: (out) => out.trim().length > 5 && out.toLowerCase() !== 'hello, i am ...',
    },
    {
        id: 2, world: 1,
        title: "Mission 2: The Ship's Log",
        worldLabel: "World 1",
        xp: 75,
        reward: "📋",
        desc: "Every spaceship keeps a log. Use <b>print()</b> multiple times to write 3 facts about yourself. You can call print() as many times as you want!",
        goal: "🎯 Goal: Print at least 3 different lines of text.",
        startCode: `# Write your space cadet profile!
print("Name: ...")
print("Age: ...")
print("Superpower: ...")`,
        hint: "Replace the ... with your real details. Add more print() lines if you like!",
        check: (out) => out.trim().split('\n').filter(l => l.trim().length > 3).length >= 3,
    },
    {
        id: 3, world: 1,
        title: "Mission 3: Variables — Space Storage",
        worldLabel: "World 1",
        xp: 100,
        reward: "📦",
        desc: "Variables are like labelled boxes that store information. You can create one by writing <b>name = \"value\"</b>. Then use the variable name in print().",
        goal: "🎯 Goal: Store your name in a variable and use it in a sentence.",
        startCode: `# Create variables to store info
name = "..."
planet = "..."
speed = 9000

print("Agent " + name + " is from " + planet)
print("Current speed:", speed, "km/h")`,
        hint: "Replace the ... in the quotes with your real name and favourite planet!",
        check: (out) => out.toLowerCase().includes("agent") && out.includes("km/h"),
    },
    {
        id: 4, world: 1,
        title: "Mission 4: Number Cruncher",
        worldLabel: "World 1",
        xp: 100,
        reward: "🔢",
        desc: "Python is an amazing calculator! It can add, subtract, multiply and divide. Use <b>+  -  *  /</b> just like a calculator. Try computing the distance to a star!",
        goal: "🎯 Goal: Calculate the light-years distance and print the result.",
        startCode: `# Python maths!
speed_of_light = 300000   # km per second
seconds_in_year = 31536000

one_light_year = speed_of_light * seconds_in_year

print("One light-year =", one_light_year, "km")
print("Distance to nearest star (Proxima Centauri):")
print(4.24 * one_light_year, "km away!")`,
        hint: "Just press Run! All the maths is already there. Try changing 4.24 to a different number!",
        check: (out) => out.includes("km") && out.includes("light"),
    },

    // ─── WORLD 2: LOGIC & LOOPS ───────────────────
    {
        id: 5, world: 2,
        title: "Mission 5: The Airlock",
        worldLabel: "World 2",
        xp: 125,
        reward: "🔐",
        desc: "The airlock needs a password! Use an <b>if / else</b> statement to check it. If the password is correct, open the door. Otherwise, keep it locked.",
        goal: "🎯 Goal: Change the password variable so it says \"Access Granted\".",
        startCode: `# Airlock security system
password = "wrong"

if password == "stargate":
    print("✅ Access Granted! Welcome aboard.")
    print("🚀 Airlock opening...")
else:
    print("❌ Wrong password! Access Denied.")
    print("🔒 Airlock sealed.")`,
        hint: "Change \"wrong\" to \"stargate\" on the first line — the password is already in the code!",
        check: (out) => out.includes("Granted"),
    },
    {
        id: 6, world: 2,
        title: "Mission 6: Asteroid Counter",
        worldLabel: "World 2",
        xp: 150,
        reward: "☄️",
        desc: "Asteroids incoming! Use a <b>for loop</b> to count them. A for loop repeats code multiple times automatically. <b>range(n)</b> repeats n times.",
        goal: "🎯 Goal: Print exactly 8 asteroid warnings.",
        startCode: `# Asteroid alert system!
print("ASTEROID FIELD DETECTED")
print("Scanning...")

for i in range(3):   # Change 3 to 8!
    print("⚠️  Asteroid", i + 1, "detected!")

print("Scan complete.")`,
        hint: "Change the number inside range() from 3 to 8. The loop will repeat 8 times!",
        check: (out) => (out.match(/Asteroid/g) || []).length >= 8,
    },
    {
        id: 7, world: 2,
        title: "Mission 7: Warp Speed Calculator",
        worldLabel: "World 2",
        xp: 175,
        reward: "⚡",
        desc: "We need to calculate fuel for different warp speeds! Use a <b>for loop with a list</b> and an <b>if/else inside the loop</b> to decide if each speed is safe.",
        goal: "🎯 Goal: Loop through all warp speeds and label them SAFE or DANGER.",
        startCode: `# Warp speed safety checker
warp_speeds = [1, 3, 5, 7, 9, 10]

for speed in warp_speeds:
    fuel_needed = speed * speed * 10
    
    if speed <= 7:
        status = "✅ SAFE"
    else:
        status = "⚠️  DANGER"
    
    print("Warp", speed, "→ Fuel:", fuel_needed, "units →", status)

print("\\nAll speeds checked!")`,
        hint: "Just press Run! Read the output carefully. Try adding more speeds to the list.",
        check: (out) => out.includes("SAFE") && out.includes("DANGER"),
    },
    {
        id: 8, world: 2,
        title: "Mission 8: Functions — Your Own Commands",
        worldLabel: "World 2",
        xp: 200,
        reward: "🛠️",
        desc: "Functions let you create your own commands! Use <b>def name():</b> to define one. Then call it by name whenever you need it. Create a launch countdown function!",
        goal: "🎯 Goal: Define the countdown function and call it with 5.",
        startCode: `# Create your own command!
def countdown(start):
    print("🚀 LAUNCH SEQUENCE INITIATED")
    for i in range(start, 0, -1):
        print(i, "...")
    print("🔥 LIFTOFF!")

# Now CALL the function:
countdown(5)
print("\\nShip has left the atmosphere!")`,
        hint: "Press Run to see it work! Try calling countdown(10) at the bottom for a longer countdown.",
        check: (out) => out.includes("LIFTOFF") && out.includes("1"),
    },

    // ─── WORLD 3: CREATIVE CODE ───────────────────
    {
        id: 9, world: 3,
        title: "Mission 9: Space Painter",
        worldLabel: "World 3",
        xp: 250,
        reward: "🎨",
        desc: "Time to paint! This mission uses special drawing functions. You can draw rectangles, circles, and text on the canvas. Check the <b>🎨 Canvas</b> tab to see your art!",
        goal: "🎯 Goal: Draw at least one shape of each type: rect, circle, and text.",
        startCode: `# Space Painter — draw on the canvas!
# Switch to the Canvas tab to see your drawing.

clear_screen()
set_background("midnightblue")

# Draw the sun (a big yellow circle)
draw_circle(140, 130, 50, "gold")

# Draw a planet
draw_circle(260, 80, 25, "tomato")

# Draw a moon
draw_circle(50, 60, 15, "lightgray")

# Draw a spaceship (rectangle)
draw_rect(120, 220, 60, 30, "silver")
draw_rect(140, 205, 20, 20, "lightblue")

# Add a label
draw_text("My Solar System", 50, 265, "white", 16)`,
        hint: "Switch to the 🎨 Canvas tab after pressing Run. Try changing the colours and numbers!",
        check: (out, canvasUsed) => canvasUsed,
        usesCanvas: true,
    },
    {
        id: 10, world: 3,
        title: "Mission 10: The Final Program",
        worldLabel: "World 3",
        xp: 500,
        reward: "🏆",
        desc: "This is your final mission, cadet! Combine <b>variables</b>, <b>loops</b>, <b>functions</b>, <b>if/else</b>, and <b>drawing</b> into one complete program. You'll build an animated star field! Read the code carefully — then make it your own.",
        goal: "🎯 Goal: Run the program and then customise it — change colours, counts, or add your name!",
        startCode: `# ★ THE FINAL MISSION ★
# A complete program using everything you've learned!

import random

# --- Setup ---
clear_screen()
set_background("black")

# --- Variables ---
star_count = 40
your_name = "Space Hero"   # ← Change this!
ship_color = "cyan"         # ← Change this!

# --- Function to draw a star ---
def draw_star(x, y, size, color):
    draw_circle(x, y, size, color)

# --- Draw the star field using a loop ---
colors = ["white", "yellow", "lightblue", "pink"]
for i in range(star_count):
    x = random.randint(5, 275)
    y = random.randint(5, 220)
    size = random.randint(1, 4)
    color = colors[i % len(colors)]
    draw_star(x, y, size, color)

# --- Draw the spaceship ---
draw_rect(110, 225, 70, 25, ship_color)
draw_circle(145, 220, 14, ship_color)

# --- Victory message ---
draw_text("Captain " + your_name, 40, 260, "gold", 15)
print("🏆 MISSION COMPLETE!")
print("You are now a Python Hero,", your_name + "!")
print("\\nYou have mastered:")
skills = ["Variables", "Print", "If/Else", "For Loops", "Functions", "Drawing"]
for skill in skills:
    print("  ✅", skill)`,
        hint: "Change your_name and ship_color variables. Look at the Canvas tab for the drawing!",
        check: (out) => out.includes("MISSION COMPLETE") && out.includes("Python Hero"),
        usesCanvas: true,
    },
];

// ── App State ──────────────────────────────────
let currentMission = 0;
let pyodide = null;
let completed = JSON.parse(localStorage.getItem('pyHeroProgress_v2') || '[]');
let totalXP    = parseInt(localStorage.getItem('pyHeroXP_v2') || '0');
let canvasWasDrawn = false;

// ── Init Pyodide ───────────────────────────────
async function init() {
    const msgs = [
        "Booting up Python Engine...",
        "Loading space modules...",
        "Calibrating warp drives...",
        "Almost ready..."
    ];
    let mi = 0;
    const msgEl = document.getElementById('loader-msg');
    const msgInterval = setInterval(() => {
        mi = (mi + 1) % msgs.length;
        msgEl.textContent = msgs[mi];
    }, 1200);

    pyodide = await loadPyodide();

    // Override input() to use browser prompt
    await pyodide.runPythonAsync(`
import builtins
from js import prompt
def custom_input(p=""):
    result = prompt(p)
    return result if result is not None else ""
builtins.input = custom_input
    `);

    // Load canvas helpers
    await pyodide.runPythonAsync(CANVAS_HELPERS);

    clearInterval(msgInterval);

    // Generate stars
    generateStars();

    document.getElementById('loader').style.display = 'none';
    loadMission(0);
    updateUI();
}

// ── Stars background ───────────────────────────
function generateStars() {
    const container = document.getElementById('stars');
    for (let i = 0; i < 120; i++) {
        const s = document.createElement('div');
        s.className = 'star';
        const size = Math.random() * 2.5 + 0.5;
        s.style.cssText = `
            width:${size}px; height:${size}px;
            left:${Math.random()*100}%;
            top:${Math.random()*100}%;
            --dur:${(Math.random()*4+2).toFixed(1)}s;
            --op:${(Math.random()*0.6+0.2).toFixed(2)};
            animation-delay:${(Math.random()*5).toFixed(1)}s;
        `;
        container.appendChild(s);
    }
}

// ── Load a mission ─────────────────────────────
function loadMission(index) {
    currentMission = index;
    const m = missions[index];

    document.getElementById('mission-title').innerText = m.title;
    document.getElementById('mission-desc').innerHTML = m.desc;
    document.getElementById('mission-goal').innerText = m.goal;
    document.getElementById('mission-world-badge').textContent = m.worldLabel;
    document.getElementById('mission-xp-badge').textContent = `+${m.xp} XP`;
    document.getElementById('code-editor').value = m.startCode;
    document.getElementById('console-output').innerText = 'Console ready — press ▶ RUN MISSION!';
    document.getElementById('celebration-zone').innerHTML = '';
    clearCanvas();
    canvasWasDrawn = false;

    // Auto-switch tab
    switchTab(m.usesCanvas ? 'canvas' : 'console');

    updateLineNumbers();
    updateUI();

    // Scroll editor to top
    document.getElementById('code-editor').scrollTop = 0;
}

// ── Run Code ───────────────────────────────────
async function runCode() {
    if (!pyodide) return;

    const code = document.getElementById('code-editor').value;
    const outputEl = document.getElementById('console-output');
    const m = missions[currentMission];

    outputEl.innerText = '';
    clearCanvas();
    canvasWasDrawn = false;

    // Re-inject canvas helpers each run
    await pyodide.runPythonAsync(CANVAS_HELPERS);

    let fullOutput = '';
    pyodide.setStdout({
        batched: (str) => {
            fullOutput += str + '\n';
            outputEl.innerText = fullOutput;
        }
    });

    try {
        await pyodide.runPythonAsync(code);

        // Detect canvas use
        const imageData = ctx2d.getImageData(0, 0, pyCanvas.width, pyCanvas.height).data;
        canvasWasDrawn = imageData.some(v => v !== 0);

        if (m.usesCanvas && canvasWasDrawn) {
            switchTab('canvas');
        }

        // Check success
        const passed = m.usesCanvas
            ? m.check(fullOutput, canvasWasDrawn)
            : m.check(fullOutput);

        if (passed) {
            handleWin();
        } else {
            if (fullOutput.trim() === '') {
                outputEl.innerText = '(no text output — check the Canvas tab!)';
            }
        }
    } catch (err) {
        outputEl.innerHTML = `<span class="console-error">❌ Error:\n${err.message}</span>`;
    }
}

// ── Handle Win ────────────────────────────────
function handleWin() {
    const m = missions[currentMission];
    const alreadyDone = completed.includes(m.id);

    if (!alreadyDone) {
        completed.push(m.id);
        totalXP += m.xp;
        localStorage.setItem('pyHeroProgress_v2', JSON.stringify(completed));
        localStorage.setItem('pyHeroXP_v2', totalXP.toString());

        // Check world completion badges
        checkWorldBadge();
    }

    const isLast = currentMission === missions.length - 1;

    document.getElementById('celebration-zone').innerHTML = `
        <div class="success-box">
            <h3>🌟 MISSION CLEAR! ${m.reward}</h3>
            <p>${alreadyDone ? 'Already completed — well done again!' : `+${m.xp} XP earned!`}</p>
            ${isLast
                ? `<button class="btn btn-run" onclick="showFinalWin()">🏆 CLAIM VICTORY!</button>`
                : `<button class="btn btn-run" onclick="nextMission()">NEXT MISSION →</button>`
            }
        </div>
    `;
    updateUI();
}

// ── World badge checks ────────────────────────
const WORLD_BADGES = [
    { ids: [1,2,3,4], badge: '🌍', msg: 'You completed World 1: The Basics!\nYou can now print, use variables, and do maths.', key: 'w1' },
    { ids: [5,6,7,8], badge: '🔥', msg: 'You completed World 2: Logic & Loops!\nIf/else, for loops, and functions — you got them!', key: 'w2' },
    { ids: [9,10],    badge: '🎨', msg: 'You completed World 3: Creative Code!\nYou can draw with Python — you are a real coder!', key: 'w3' },
];

function checkWorldBadge() {
    for (const wb of WORLD_BADGES) {
        const allDone = wb.ids.every(id => completed.includes(id));
        const alreadyShown = localStorage.getItem('pyHeroBadge_' + wb.key);
        if (allDone && !alreadyShown) {
            localStorage.setItem('pyHeroBadge_' + wb.key, '1');
            setTimeout(() => showModal(wb.badge, 'WORLD COMPLETE!', wb.msg), 800);
        }
    }
}

function showModal(emoji, title, msg) {
    document.getElementById('levelup-emoji').textContent = emoji;
    document.querySelector('#levelup-modal h2').textContent = title;
    document.getElementById('levelup-msg').textContent = msg;
    document.getElementById('levelup-modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('levelup-modal').style.display = 'none';
}

function showFinalWin() {
    showModal('🏆', 'YOU ARE A PYTHON HERO!', 
        'You completed all 10 missions!\n\nYou have learned print, variables, maths, if/else, for loops, functions, and even drawing.\n\nYou are officially a coder. What will you build next?');
}

// ── Navigation ────────────────────────────────
function nextMission() {
    if (currentMission < missions.length - 1) {
        loadMission(currentMission + 1);
    }
}

function resetCode() {
    document.getElementById('code-editor').value = missions[currentMission].startCode;
    updateLineNumbers();
}

// ── Hint (toast instead of alert) ────────────
function showHint() {
    let toast = document.getElementById('hint-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'hint-toast';
        document.body.appendChild(toast);
    }

    if (toast.classList.contains('show')) {
        toast.classList.remove('show');
        clearTimeout(hintTimer);
        return;
    }

    toast.innerHTML = `
        <div class="hint-title">💡 HINT</div>
        ${missions[currentMission].hint}
        <div style="text-align:right; margin-top:10px;">
            <button onclick="document.getElementById('hint-toast').classList.remove('show')" 
                style="background:transparent; border:1px solid #f59e0b; color:#f59e0b; 
                padding:4px 12px; border-radius:6px; cursor:pointer; font-size:0.8rem;">
                CLOSE
            </button>
        </div>
    `;
    toast.classList.add('show');
    clearTimeout(hintTimer);
    hintTimer = setTimeout(() => toast.classList.remove('show'), 8000);
}

// ── Tab switching ─────────────────────────────
function switchTab(tab) {
    document.getElementById('tab-console').classList.toggle('active', tab === 'console');
    document.getElementById('tab-canvas').classList.toggle('active', tab === 'canvas');
    document.getElementById('panel-console').style.display = tab === 'console' ? 'flex' : 'none';
    document.getElementById('panel-canvas').style.display  = tab === 'canvas'  ? 'flex' : 'none';
}

// ── Line numbers ──────────────────────────────
function updateLineNumbers() {
    const ta = document.getElementById('code-editor');
    const lines = ta.value.split('\n').length;
    const ln = document.getElementById('line-numbers');
    ln.textContent = Array.from({length: lines}, (_, i) => i + 1).join('\n');
}

document.getElementById('code-editor').addEventListener('input', updateLineNumbers);
document.getElementById('code-editor').addEventListener('scroll', () => {
    document.getElementById('line-numbers').scrollTop = document.getElementById('code-editor').scrollTop;
});

// Handle Tab key in editor
document.getElementById('code-editor').addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        e.preventDefault();
        const ta = e.target;
        const start = ta.selectionStart;
        ta.value = ta.value.slice(0, start) + '    ' + ta.value.slice(ta.selectionEnd);
        ta.selectionStart = ta.selectionEnd = start + 4;
        updateLineNumbers();
    }
});

// ── Update UI ─────────────────────────────────
function updateUI() {
    // Progress bar
    const pct = (completed.length / missions.length) * 100;
    document.getElementById('progress-bar').style.width = pct + '%';
    document.getElementById('progress-text').textContent = `${completed.length} / ${missions.length}`;

    // XP
    document.getElementById('xp-count').textContent = totalXP;

    // Badges on header
    const earnedBadges = missions.filter(m => completed.includes(m.id)).map(m => m.reward);
    document.getElementById('badge-shelf').textContent = earnedBadges.join(' ');

    // Mission lists by world
    for (let w = 1; w <= 3; w++) {
        const list = document.getElementById(`mission-list-${w}`);
        list.innerHTML = '';
        missions.filter(m => m.world === w).forEach(m => {
            const i = missions.indexOf(m);
            const isLocked = i > 0 && !completed.includes(missions[i - 1].id);
            const isDone   = completed.includes(m.id);
            const isActive = i === currentMission;

            const div = document.createElement('div');
            div.className = `m-item${isActive ? ' active' : ''}${isLocked ? ' locked' : ''}${isDone ? ' done' : ''}`;
            div.innerHTML = `
                <span>${isDone ? '✅' : isLocked ? '🔒' : '🚀'}</span>
                <span>Mission ${m.id}</span>
                ${isDone ? `<span style="margin-left:auto;font-size:0.8rem;opacity:0.7">+${m.xp}</span>` : ''}
            `;
            if (!isLocked) div.onclick = () => loadMission(i);
            list.appendChild(div);
        });
    }
}

// ── Boot! ─────────────────────────────────────
init();
