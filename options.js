document.addEventListener('DOMContentLoaded', () => {
    const apiKeyInput = document.getElementById('google-api-key');
    const saveBtn = document.getElementById('save-btn');
    const statusMsg = document.getElementById('status-msg');
    const backspaceToggle = document.getElementById('backspace-toggle');

    // Load existing settings
    chrome.storage.local.get(['googleApiKey'], (result) => {
        if (result.googleApiKey) {
            apiKeyInput.value = result.googleApiKey;
        }
    });

    // Load backspace setting from sync storage
    chrome.storage.sync.get(['backspaceEnabled'], (result) => {
        // Default to true if undefined
        if (result.backspaceEnabled === undefined) {
            backspaceToggle.checked = true;
        } else {
            backspaceToggle.checked = result.backspaceEnabled;
        }
    });

    saveBtn.addEventListener('click', () => {
        const key = apiKeyInput.value.trim();
        const backspaceEnabled = backspaceToggle.checked;

        // Save API Key to local
        chrome.storage.local.set({ googleApiKey: key }, () => {
            // Save Backspace to sync
            chrome.storage.sync.set({ backspaceEnabled: backspaceEnabled }, () => {
                statusMsg.textContent = 'Settings saved.';
                statusMsg.style.color = '#10b981'; // Green
                setTimeout(() => {
                    statusMsg.textContent = '';
                }, 2000);
            });
        });
    });
});
