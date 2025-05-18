function saveToken() {
  const token = document.getElementById("apiToken").value;
  chrome.storage.local.set({ clinicorpToken: token }, () => {
    alert("Token saved!");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get("clinicorpToken", (data) => {
    if (data.clinicorpToken) {
      document.getElementById("apiToken").value = data.clinicorpToken;
    }
  });
});