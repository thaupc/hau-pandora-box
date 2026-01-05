chrome.action.onClicked.addListener(() => {
    chrome.tabs.create({ url: 'toolbox.html' });
});
