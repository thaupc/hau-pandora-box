function textToHex(text) {
    let hex = '';
    for (let i = 0; i < text.length; i++) {
        hex += text.charCodeAt(i).toString(16).padStart(2, '0') + ' ';
    }
    return hex.trim();
}

function hexToText(hex) {
    hex = hex.replace(/\s/g, '');
    if (hex.length % 2 !== 0) throw new Error('Invalid Hex length');
    let text = '';
    for (let i = 0; i < hex.length; i += 2) {
        text += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return text;
}

document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('text-input');
    const hexInput = document.getElementById('hex-input');
    const toHexBtn = document.getElementById('to-hex-btn');
    const toTextBtn = document.getElementById('to-text-btn');
    const errorMsg = document.getElementById('error-msg');

    toHexBtn.addEventListener('click', () => {
        try {
            errorMsg.textContent = '';
            hexInput.value = textToHex(textInput.value);
        } catch (e) {
            errorMsg.textContent = 'Error converting to Hex';
        }
    });

    toTextBtn.addEventListener('click', () => {
        try {
            errorMsg.textContent = '';
            textInput.value = hexToText(hexInput.value);
        } catch (e) {
            errorMsg.textContent = 'Invalid Hex string';
        }
    });
});
