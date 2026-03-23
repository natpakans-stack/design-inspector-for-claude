// Design Inspector for Claude — Background Service Worker

// ─── Offscreen document for clipboard ────────────────
let offscreenCreating = null;

async function ensureOffscreen() {
  if (await chrome.offscreen.hasDocument()) return;
  if (offscreenCreating) { await offscreenCreating; return; }
  offscreenCreating = chrome.offscreen.createDocument({
    url: 'offscreen.html',
    reasons: ['CLIPBOARD'],
    justification: 'Copy element data to clipboard',
  });
  await offscreenCreating;
  offscreenCreating = null;
}

// ─── Message handler ─────────────────────────────────
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

  if (message.type === 'COPY_TEXT') {
    (async () => {
      try {
        await ensureOffscreen();
        const result = await chrome.runtime.sendMessage({
          type: 'OFFSCREEN_COPY_TEXT',
          text: message.text,
        });
        sendResponse(result);
      } catch (e) {
        sendResponse({ success: false, error: e.message });
      }
    })();
    return true;
  }

  if (message.type === 'TOGGLE_FROM_POPUP') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'TOGGLE_INSPECTOR' }, (response) => {
          sendResponse(response);
        });
      }
    });
    return true;
  }
});

// ─── Keyboard shortcut ──────────────────────────────
chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle-inspector') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'TOGGLE_INSPECTOR' });
      }
    });
  }
});
