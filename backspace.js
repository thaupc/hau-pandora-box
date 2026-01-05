let backspaceEnabled = true;

// Load initial setting
chrome.storage.sync.get(['backspaceEnabled'], (result) => {
    if (result.backspaceEnabled === false) {
        backspaceEnabled = false;
    }
});

// Listen for changes
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync' && changes.backspaceEnabled) {
        backspaceEnabled = changes.backspaceEnabled.newValue;
    }
});

document.addEventListener('keydown', function (e) {
    // Check if the key is Backspace
    if (e.key === 'Backspace') {
        const active = document.activeElement;
        const tagName = active.tagName.toLowerCase();
        const isInput = tagName === 'input' || tagName === 'textarea' || active.isContentEditable;

        if (!isInput && backspaceEnabled) {
            // Prevent default behavior just in case, though usually none for Backspace nowadays
            // e.preventDefault(); 
            window.history.back();
        }
    }
});
