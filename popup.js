function saveToken() {
  const username = document.getElementById("username").value;
  const token = document.getElementById("token").value;
  chrome.storage.local.set({ clinicorpUsername: username, clinicorpToken: token }, () => {
    alert("Credentials saved!");
  });
}