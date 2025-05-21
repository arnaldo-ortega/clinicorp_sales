const PANEL_ID = "clinicorp-panel";
const TOGGLE_ID = "clinicorp-toggle";

function createPanel() {
  if (document.getElementById(PANEL_ID)) return;

  const panel = document.createElement("div");
  panel.id = PANEL_ID;
  panel.style = `
  position: fixed;
  top: 0;
  right: -25%;
  width: 25%;
  height: 100%;
  background: #fff;
  color: #000;
  font-family: sans-serif;
  box-shadow: -2px 0 5px rgba(0,0,0,0.3);
  z-index: 9999;
  padding: 10px;
  overflow-y: auto;
  transition: right 0.3s ease;
  pointer-events: auto;
  `;
  panel.innerHTML = `
    <h3>Clinicorp Sales</h3>
    <div id="authStatus">🔄 Checking login...</div>
    <div id="loginForm" style="margin-top: 15px;">
      <input id="uidInput" type="text" placeholder="User ID" style="width: 100%; margin-bottom: 8px; padding: 5px;" />
      <input id="tokenInput" type="password" placeholder="API Token" style="width: 100%; margin-bottom: 8px; padding: 5px;" />
      <button id="loginBtn" style="width: 100%; padding: 5px;">Login</button>
    </div>
  `;
  document.body.appendChild(panel);

  // Detect dark mode and apply styles
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  panel.style.background = prefersDark ? "#1e1e1e" : "#fff";
  panel.style.color = prefersDark ? "#eee" : "#000";

  // Autofill saved credentials
  chrome.storage.local.get(["clinicorpUsername", "clinicorpToken"], (data) => {
    if (data.clinicorpUsername) document.getElementById("uidInput").value = data.clinicorpUsername;
    if (data.clinicorpToken) document.getElementById("tokenInput").value = data.clinicorpToken;
  });

  // Login button handler
  setTimeout(() => {
    const loginBtn = document.getElementById("loginBtn");
    loginBtn.onclick = () => {
      const uid = document.getElementById("uidInput").value.trim();
      const token = document.getElementById("tokenInput").value.trim();

      if (!uid || !token) {
        document.getElementById("authStatus").textContent = "⚠️ Please enter both UID and Token.";
        return;
      }

      chrome.storage.local.set({
        clinicorpUsername: uid,
        clinicorpToken: token
      }, () => {
        document.getElementById("authStatus").textContent = "🔁 Trying login...";
        checkClinicorpLoginStatus();
      });
    };
  }, 0);

  // Save auth data when button clicked
  setTimeout(() => {
    const saveBtn = document.getElementById("saveAuthBtn");
    if (saveBtn) {
      saveBtn.onclick = () => {
        const uid = document.getElementById("uidInput").value;
        const token = document.getElementById("tokenInput").value;
        chrome.storage.local.set({
          clinicorpUsername: uid,
          clinicorpToken: token
        }, () => {
          document.getElementById("authStatus").textContent = "🔁 Saved. Rechecking login...";
          checkClinicorpLoginStatus();
        });
      };
    }
  }, 0);

  // Add toggle button
  const toggle = document.createElement("button");
  toggle.id = TOGGLE_ID;
  toggle.textContent = "⇦";
  toggle.style = `
    position: fixed;
    top: 10px;
    right: 0;
    z-index: 10000;
    pointer-events: auto;
    padding: 5px 10px;
    border-radius: 4px 0 0 4px;
    background-color: #25D366;
    color: white;
    border: none;
    cursor: pointer;
  `;

  toggle.onclick = () => {
    const isOpen = panel.style.right === "0px";
    panel.style.right = isOpen ? "-25%" : "0px";
    toggle.textContent = isOpen ? "⇦" : "⇨";

    // Shift the WhatsApp main container
    const container = document.querySelector("#app > div");
    if (container) {
      container.style.transition = "margin-right 0.3s ease";
      container.style.marginRight = isOpen ? "0" : "25%";
    }
  };

  document.body.appendChild(toggle);

  checkClinicorpLoginStatus();
}

function checkClinicorpLoginStatus() {
  chrome.storage.local.get(["clinicorpUsername", "clinicorpToken"], (data) => {
    const statusDiv = document.getElementById("authStatus");

    if (!data.clinicorpUsername || !data.clinicorpToken) {
      statusDiv.textContent = "❌ Not connected. Please open extension and login.";
      return;
    }

    const authHeader = "Basic " + btoa(`${data.clinicorpUsername}:${data.clinicorpToken}`);

    fetch("https://sistema.clinicorp.com/api/v1/pacientes", {
      method: "GET",
      headers: {
        "Authorization": authHeader,
        "Content-Type": "application/json"
      }
    })
    .then(response => {
      if (response.ok) {
        statusDiv.textContent = "✅ Connected to Clinicorp";
      } else {
        statusDiv.textContent = "❌ Invalid credentials or error.";
      }
    })
    .catch(() => {
      statusDiv.textContent = "⚠️ Connection error. Check internet or token.";
    });
  });
}

const checkLoaded = setInterval(() => {
  const appRoot = document.querySelector("#app");
  const chatGrid = document.querySelector("div[role='grid']");

  if (appRoot && chatGrid) {
    clearInterval(checkLoaded);
    createPanel();
  }
}, 1000);

