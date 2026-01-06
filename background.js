chrome.action.onClicked.addListener(() => {
    chrome.tabs.create({ url: 'toolbox.html' });
});

chrome.omnibox.onInputEntered.addListener((text) => {
    chrome.storage.sync.get(['jiraRedirectEnabled', 'jiraSubdomain', 'jiraProjectKey'], (result) => {
        // Default to enabled if undefined
        const enabled = result.jiraRedirectEnabled !== false;

        if (!enabled) {
            // Fallback to Google search if disabled
            chrome.tabs.update({ url: `https://www.google.com/search?q=hn+${encodeURIComponent(text)}` });
            return;
        }

        const subdomain = result.jiraSubdomain || 'emobi';
        const defaultProjectKey = result.jiraProjectKey || 'EM';

        // Check for "KEY NUMBER" format (e.g. "KB 123")
        const explicitMatch = text.match(/^([a-zA-Z]+)\s+(\d+)$/);
        if (explicitMatch) {
            const ticket = `${explicitMatch[1].toUpperCase()}-${explicitMatch[2]}`;
            const url = `https://${subdomain}.atlassian.net/browse/${ticket}`;
            chrome.tabs.update({ url });
            return;
        }

        // Check for "NUMBER" format (e.g. "123") using default key
        const numberMatch = text.match(/^(\d+)$/);
        if (numberMatch) {
            const ticket = `${defaultProjectKey}-${numberMatch[1]}`;
            const url = `https://${subdomain}.atlassian.net/browse/${ticket}`;
            chrome.tabs.update({ url });
        } else {
            // Search in Jira
            chrome.tabs.update({ url: `https://${subdomain}.atlassian.net/jira/software/c/projects/${defaultProjectKey}/issues/?jql=text~"${text}"` });
        }
    });
});
