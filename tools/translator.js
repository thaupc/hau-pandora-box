document.addEventListener('DOMContentLoaded', () => {
    const sourceText = document.getElementById('source-text');
    const targetText = document.getElementById('target-text');
    const sourceLang = document.getElementById('source-lang');
    const targetLang = document.getElementById('target-lang');
    const translateBtn = document.getElementById('translate-btn');
    const errorBanner = document.getElementById('error-banner');

    let apiKey = '';

    // Load API Key
    chrome.storage.local.get(['googleApiKey'], (result) => {
        if (result.googleApiKey) {
            apiKey = result.googleApiKey;
        } else {
            showError('API Key is missing. Please configure it in Settings.');
        }
    });

    translateBtn.addEventListener('click', () => {
        const text = sourceText.value.trim();
        if (!text) return;
        if (!apiKey) {
            showError('API Key is missing. Please configure it in Settings.');
            return;
        }

        translate(text, sourceLang.value, targetLang.value);
    });

    function showError(msg) {
        errorBanner.textContent = msg;
        errorBanner.style.display = 'block';
    }

    function hideError() {
        errorBanner.style.display = 'none';
        errorBanner.textContent = '';
    }

    async function translate(text, source, target) {
        hideError();
        targetText.value = 'Translating...';

        const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;

        const data = {
            q: text,
            target: target,
            format: 'text'
        };

        if (source !== 'auto') {
            data.source = source;
        }

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const json = await response.json();

            if (!response.ok) {
                const err = json.error && json.error.message ? json.error.message : 'Unknown error';
                throw new Error(err);
            }

            if (json.data && json.data.translations && json.data.translations.length > 0) {
                targetText.value = json.data.translations[0].translatedText;
            } else {
                targetText.value = '';
                showError('No translation returned.');
            }

        } catch (e) {
            targetText.value = '';
            showError(`Error: ${e.message}`);
        }
    }
});
