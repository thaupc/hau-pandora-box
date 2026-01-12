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

// --- Rewards Helper Integration ---
{
    let topics = {};
    let isRunning = false;
    let stopRequested = false;
    let openedTabs = 0;
    let totalTabs = 0;

    const sleep = ms => new Promise(res => setTimeout(res, ms));

    // --- Helpers to build realistic Bing search URLs with common query parameters ---
    const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const randHex = (len = 8) => {
        let s = '';
        const hex = '0123456789abcdef';
        for (let i = 0; i < len; i++) s += hex[Math.floor(Math.random() * hex.length)];
        return s;
    };

    function buildBingUrl(query, opts = {}) {
        // opts can override defaults for testing
        const q = encodeURIComponent(query);
        const qs = opts.qs || 'SS'; // query source (suggestion)
        const pq = opts.pq ? encodeURIComponent(opts.pq) : '';
        const sp = opts.sp || String(randInt(1, 5)); // suggestion position
        const sc = opts.sc || `${randInt(1, 30)}-${randInt(1, 9)}`; // score-like string
        const sk = opts.sk || randHex(12); // session key / suggestion key
        const cvid = opts.cvid || `${randHex(8)}-${randHex(4)}-${randHex(4)}`; // correlation id
        const refig = opts.refig || randHex(12);
        const FORM = opts.FORM || 'QBRE';
        const pc = opts.pc || 'U531';

        const params = [];
        params.push(`q=${q}`);
        if (pq) params.push(`pq=${pq}`);
        params.push(`qs=${qs}`);
        params.push(`sp=${sp}`);
        params.push(`sc=${sc}`);
        params.push(`sk=${sk}`);
        params.push(`cvid=${cvid}`);
        params.push(`refig=${refig}`);
        params.push(`FORM=${FORM}`);
        params.push(`pc=${pc}`);

        return `https://www.bing.com/search?${params.join('&')}`;
    }

    async function loadTopics() {
        try {
            const response = await fetch(chrome.runtime.getURL('tools/rewards-helper/topics.json'));
            if (!response.ok) throw new Error(`Failed to fetch topics: ${response.statusText}`);
            topics = await response.json();
            console.log("Topics loaded successfully.");
        } catch (error) {
            console.error("Error loading topics:", error);
        }
    }

    const resetState = () => {
        isRunning = false;
        stopRequested = false;
        openedTabs = 0;
        totalTabs = 0;
        setTimeout(() => {
            chrome.action.setBadgeText({ text: '' });
        }, 2000);
        // broadcast reset status
        try { chrome.runtime.sendMessage({ type: 'status', isRunning, openedTabs, totalTabs }); } catch (e) { }
    };

    function sendStatus() {
        try {
            chrome.runtime.sendMessage({ type: 'status', isRunning, openedTabs, totalTabs });
        } catch (e) {
            // service worker may be inactive
        }
    }

    async function getSettings() {
        const defaults = { tabsToOpen: 1, delayMode: 'immediate', fixedDelaySeconds: 5, customTopics: [] };
        const settings = await chrome.storage.local.get(defaults);
        return settings;
    }

    function selectSearchTopics(settings, allTopics) {
        const { tabsToOpen: numToOpen, customTopics = [] } = settings;
        const rawPool = (customTopics && customTopics.length) ? customTopics : Object.values(allTopics).flat();

        if (!rawPool || rawPool.length === 0) {
            return [];
        }

        const uniquePool = Array.from(new Set(rawPool.map(t => t && t.toString().trim()).filter(Boolean)));
        const shuffled = uniquePool.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, numToOpen);
    }

    async function runSearchSession(selectedTopics, settings) {
        const { delayMode, fixedDelaySeconds } = settings;
        const firstTopic = selectedTopics.shift();
        const firstUrl = buildBingUrl(firstTopic);

        const createdTab = await new Promise(resolve => chrome.tabs.create({ url: firstUrl, active: true }, tab => resolve(tab)));
        if (!createdTab) {
            console.error("Could not create a new tab.");
            return;
        }

        const tabId = createdTab.id;
        if (!tabId) {
            console.error("Could not get created tab id.");
            return;
        }

        openedTabs++;
        await chrome.action.setBadgeText({ text: `${openedTabs}/${totalTabs}` });
        sendStatus();

        let previousTopic = firstTopic;
        const executedTopics = [firstTopic];

        for (const topic of selectedTopics) {
            if (stopRequested) {
                console.log("Stop request received. Halting operation.");
                break;
            }

            if (delayMode !== 'immediate') {
                const delayMs = (delayMode === 'fixed') ? fixedDelaySeconds * 1000 : randInt(5000, 20000);
                await sleep(delayMs);
            }

            if (stopRequested) {
                console.log("Stop request received. Halting operation.");
                break;
            }

            const url = buildBingUrl(topic, { pq: previousTopic });
            await new Promise(resolve => {
                chrome.tabs.update(tabId, { url }, () => {
                    if (!stopRequested) {
                        openedTabs++;
                        chrome.action.setBadgeText({ text: `${openedTabs}/${totalTabs}` });
                        sendStatus();
                    }
                    resolve();
                });
            });
            previousTopic = topic;
            executedTopics.push(topic);
        }

        return executedTopics;
    }

    const openTabs = async () => {
        if (isRunning) {
            console.log("A session is already running.");
            return;
        }

        try {
            isRunning = true;
            stopRequested = false;
            console.log("Starting search session...");

            const settings = await getSettings();

            const storageData = await chrome.storage.local.get(['seenTopics', 'runLogs']);
            let seenTopics = storageData.seenTopics || {};
            let runLogs = storageData.runLogs || [];

            const { tabsToOpen: numToOpen, customTopics = [] } = settings;
            const rawPool = (customTopics && customTopics.length) ? customTopics : Object.values(topics).flat();
            const uniquePool = Array.from(new Set(rawPool.map(t => t && t.toString().trim()).filter(Boolean)));
            let available = uniquePool.filter(t => !(t in seenTopics));

            if (available.length < numToOpen) {
                console.log("Not enough unseen topics, clearing seenTopics to rotate pool.");
                seenTopics = {};
                available = uniquePool.slice();
            }

            const shuffled = available.sort(() => 0.5 - Math.random());
            const selectedTopics = shuffled.slice(0, numToOpen);

            if (selectedTopics.length === 0) {
                console.error("No topics available to search.");
                return;
            }

            totalTabs = selectedTopics.length;
            openedTabs = 0;
            await chrome.action.setBadgeBackgroundColor({ color: '#0078D4' });
            await chrome.action.setBadgeText({ text: `${openedTabs}/${totalTabs}` });
            sendStatus();

            const executedTopics = await runSearchSession(selectedTopics, settings) || [];

            console.log("Search session finished. Executed topics:", executedTopics);

            const now = Date.now();
            executedTopics.forEach(t => { if (t) seenTopics[t] = now; });

            runLogs.push({ time: now, count: executedTopics.length, topics: executedTopics });
            const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
            runLogs = runLogs.filter(entry => (entry.time && entry.time >= sevenDaysAgo));

            try {
                await chrome.storage.local.set({ seenTopics, runLogs });
            } catch (e) {
                console.error('Failed to persist seenTopics/runLogs:', e);
            }
        } catch (error) {
            console.error("An error occurred during the search session:", error);
        } finally {
            resetState();
        }
    };

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "startOpeningTabs") {
            openTabs();
            sendResponse({ success: true });
        } else if (request.action === "stopOpeningTabs") {
            stopRequested = true;
            sendResponse({ success: true });
            console.log("Stop request queued.");
        } else if (request.action === "getStatus") {
            sendResponse({ isRunning, openedTabs, totalTabs });
        }
    });

    loadTopics();
    console.log("Rewards Helper module initialized.");
}
