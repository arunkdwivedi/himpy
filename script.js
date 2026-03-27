// --- Mission Database ---
const missions = [
    {
        id: 1,
        title: "Mission 1: Say Hello!",
        desc: "Make the computer talk! Change the message inside the quotes to your name.",
        startCode: 'print("Hello, Young Coder!")',
        check: (out) => out.length > 5,
        hint: "Type anything between the \" \" marks and press Run!",
        reward: "🎖️"
    },
    {
        id: 2,
        title: "Mission 2: Secret Identity",
        desc: "Ask the computer to store your name using <b>input()</b>.",
        startCode: 'name = input("What is your name? ")\nprint("Welcome, Agent " + name)',
        check: (out) => out.toLowerCase().includes("agent"),
        hint: "When you press Run, a box will pop up. Type your name there!",
        reward: "🆔"
    },
    {
        id: 3,
        title: "Mission 3: The Gatekeeper",
        desc: "Use an <b>if</b> statement to check the password. Change 'secret' to 'pizza'!",
        startCode: 'password = "apple"\nif password == "pizza":\n    print("Access Granted")\nelse:\n    print("Wrong password!")',
        check: (out) => out.toLowerCase().includes("granted"),
        hint: "Change 'apple' to 'pizza' in the first line.",
        reward: "🔑"
    },
    {
        id: 4,
        title: "Mission 4: Party Loop",
        desc: "We need 5 balloons! Change the number in <b>range()</b> to 5.",
        startCode: 'for i in range(2):\n    print("Balloon 🎈")',
        check: (out) => (out.match(/🎈/g) || []).length >= 5,
        hint: "The number inside range() tells the computer how many times to repeat.",
        reward: "🎈"
    },
    {
        id: 5,
        title: "Mission 5: The Final Guess",
        desc: "Combine everything! Guess the secret number (it's 7) to win the game.",
        startCode: 'secret = 7\nguess = int(input("Guess a number: "))\nif guess == secret:\n    print("YOU WIN!")',
        check: (out) => out.includes("WIN"),
        hint: "Type '7' when the input box appears!",
        reward: "🏆"
    }
];

let currentMission = 0;
let pyodide;
let completed = JSON.parse(localStorage.getItem('pyHeroProgress') || '[]');

// --- Initialize Pyodide ---
async function init() {
    pyodide = await loadPyodide();
    // Override input() to use browser prompt
    await pyodide.runPythonAsync(`
        import builtins
        from js import prompt
        def custom_input(p=""): return prompt(p)
        builtins.input = custom_input
    `);
    
    document.getElementById('loader').style.display = 'none';
    loadMission(0);
    updateUI();
}

function loadMission(index) {
    currentMission = index;
    const m = missions[index];
    document.getElementById('mission-title').innerText = m.title;
    document.getElementById('mission-desc').innerHTML = m.desc;
    document.getElementById('code-editor').value = m.startCode;
    document.getElementById('console-output').innerText = "Console ready...";
    document.getElementById('celebration-zone').innerHTML = "";
    updateUI();
}

async function runCode() {
    const code = document.getElementById('code-editor').value;
    const outputEl = document.getElementById('console-output');
    outputEl.innerText = "Running...\n";
    
    let fullOutput = "";
    pyodide.setStdout({
        batched: (str) => {
            fullOutput += str + "\n";
            outputEl.innerText = fullOutput;
        }
    });

    try {
        await pyodide.runPythonAsync(code);
        
        // Check if mission criteria met
        if (missions[currentMission].check(fullOutput)) {
            handleWin();
        }
    } catch (err) {
        outputEl.innerHTML += `<span style="color:#f43f5e">Error: ${err.message}</span>`;
    }
}

function handleWin() {
    const m = missions[currentMission];
    if (!completed.includes(m.id)) {
        completed.push(m.id);
        localStorage.setItem('pyHeroProgress', JSON.stringify(completed));
    }
    
    document.getElementById('celebration-zone').innerHTML = `
        <div class="success-box">
            <h3>🌟 MISSION CLEAR! 🌟</h3>
            <p>You earned: ${m.reward}</p>
            <button class="btn btn-run" onclick="nextMission()">CONTINUE</button>
        </div>
    `;
    updateUI();
}

function nextMission() {
    if (currentMission < missions.length - 1) {
        loadMission(currentMission + 1);
    }
}

function showHint() {
    alert("HINT: " + missions[currentMission].hint);
}

function updateUI() {
    // Progress Bar
    const percent = (completed.length / missions.length) * 100;
    document.getElementById('progress-bar').style.width = percent + "%";
    
    // Mission List
    const list = document.getElementById('mission-list');
    list.innerHTML = "";
    missions.forEach((m, i) => {
        const isLocked = i > 0 && !completed.includes(missions[i-1].id);
        const isDone = completed.includes(m.id);
        
        const div = document.createElement('div');
        div.className = `m-item ${i === currentMission ? 'active' : ''} ${isLocked ? 'locked' : ''}`;
        div.innerHTML = `<span>${isDone ? '✅' : (isLocked ? '🔒' : '🚀')}</span> Mission ${m.id}`;
        div.onclick = () => !isLocked && loadMission(i);
        list.appendChild(div);
    });

    // Badges
    document.getElementById('badge-shelf').innerHTML = completed.map(id => {
        return missions.find(x => x.id === id).reward;
    }).join(" ");
}

init();