const input = document.getElementById('text-input');
const charCount = document.getElementById('char-count');
const wordCount = document.getElementById('word-count');
const lineCount = document.getElementById('line-count');
const byteCount = document.getElementById('byte-count');

input.addEventListener('input', updateStats);

function updateStats() {
    const text = input.value;

    // Chars
    charCount.textContent = text.length;

    // Words
    const words = text.trim().split(/\s+/);
    wordCount.textContent = text.trim() === '' ? 0 : words.length;

    // Lines
    const lines = text.split('\n');
    lineCount.textContent = text === '' ? 0 : lines.length;

    // Bytes (UTF-8)
    byteCount.textContent = new Blob([text]).size;
}
