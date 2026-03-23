const toggleBtn = document.getElementById('toggleBtn');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');

function updateUI(isActive) {
  statusDot.classList.toggle('active', isActive);
  statusText.textContent = isActive ? 'Active' : 'Inactive';
  toggleBtn.textContent = isActive ? 'Disable' : 'Enable';
  toggleBtn.classList.toggle('active', isActive);
}

toggleBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'TOGGLE_FROM_POPUP' }, (response) => {
    if (response && typeof response.active === 'boolean') {
      updateUI(response.active);
    }
  });
});

// Check current state on popup open
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (tabs[0]) {
    chrome.tabs.sendMessage(tabs[0].id, { type: 'GET_STATE' }, (response) => {
      if (chrome.runtime.lastError) return;
      if (response && typeof response.active === 'boolean') {
        updateUI(response.active);
      }
    });
  }
});
