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
  `;
  document.body.appendChild(panel);

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

