document.addEventListener('DOMContentLoaded', () => {
    const apiKeyInput = document.getElementById('google-api-key');
    const saveBtn = document.getElementById('save-btn');
    const statusMsg = document.getElementById('status-msg');
    const backspaceToggle = document.getElementById('backspace-toggle');
    const simpleTabToggle = document.getElementById('simple-tab-toggle');
    const jiraRedirectToggle = document.getElementById('jira-redirect-toggle');
    const jiraSubdomainInput = document.getElementById('jira-subdomain');
    const jiraProjectKeyInput = document.getElementById('jira-project-key');

    // Load existing settings
    chrome.storage.local.get(['googleApiKey'], (result) => {
        if (result.googleApiKey) {
            apiKeyInput.value = result.googleApiKey;
        }
    });

    // Load settings from sync storage
    chrome.storage.sync.get(['backspaceEnabled', 'simpleTabEnabled', 'jiraRedirectEnabled', 'jiraSubdomain', 'jiraProjectKey'], (result) => {
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

        // Jira Redirect default true
        if (result.jiraRedirectEnabled === undefined) {
            jiraRedirectToggle.checked = true;
        } else {
            jiraRedirectToggle.checked = result.jiraRedirectEnabled;
        }

        // Load Jira config or defaults
        jiraSubdomainInput.value = result.jiraSubdomain || 'emobi';
        jiraProjectKeyInput.value = result.jiraProjectKey || 'EM';
    });

    saveBtn.addEventListener('click', () => {
        const key = apiKeyInput.value.trim();
        const backspaceEnabled = backspaceToggle.checked;
        const simpleTabEnabled = simpleTabToggle.checked;
        const jiraRedirectEnabled = jiraRedirectToggle.checked;
        const jiraSubdomain = jiraSubdomainInput.value.trim() || 'emobi';
        const jiraProjectKey = jiraProjectKeyInput.value.trim() || 'EM';

        // Save API Key to local
        chrome.storage.local.set({ googleApiKey: key }, () => {
            // Save settings to sync
            chrome.storage.sync.set({
                backspaceEnabled: backspaceEnabled,
                simpleTabEnabled: simpleTabEnabled,
                jiraRedirectEnabled: jiraRedirectEnabled,
                jiraSubdomain: jiraSubdomain,
                jiraProjectKey: jiraProjectKey
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
