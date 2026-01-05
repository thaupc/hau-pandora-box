document.addEventListener('DOMContentLoaded', () => {
    const apiKeyInput = document.getElementById('google-api-key');
    const saveBtn = document.getElementById('save-btn');
    const statusMsg = document.getElementById('status-msg');
    const backspaceToggle = document.getElementById('backspace-toggle');
    const simpleTabToggle = document.getElementById('simple-tab-toggle');

    // Load existing settings
    chrome.storage.local.get(['googleApiKey'], (result) => {
        if (result.googleApiKey) {
            apiKeyInput.value = result.googleApiKey;
        }
    });

    // Load settings from sync storage
    chrome.storage.sync.get(['backspaceEnabled', 'simpleTabEnabled'], (result) => {
        // Backspace default true
        if (result.backspaceEnabled === undefined) {
            backspaceToggle.checked = true;
        } else {
            backspaceToggle.checked = result.backspaceEnabled;
        }

        // Simple Tab default true
        if (result.simpleTabEnabled === undefined) {
            simpleTabToggle.checked = true;
        } else {
            simpleTabToggle.checked = result.simpleTabEnabled;
        }
    });

    saveBtn.addEventListener('click', () => {
        const key = apiKeyInput.value.trim();
        const backspaceEnabled = backspaceToggle.checked;
        const simpleTabEnabled = simpleTabToggle.checked;

        // Save API Key to local
        chrome.storage.local.set({ googleApiKey: key }, () => {
            // Save settings to sync
            chrome.storage.sync.set({
                backspaceEnabled: backspaceEnabled,
                simpleTabEnabled: simpleTabEnabled
            }, () => {
                statusMsg.textContent = 'Settings saved.';
                statusMsg.style.color = '#10b981'; // Green
                setTimeout(() => {
                    statusMsg.textContent = '';
                }, 2000);
            });
        });
    });
});
