document.getElementById('format-btn').addEventListener('click', () => processJSON(2));
document.getElementById('minify-btn').addEventListener('click', () => processJSON(0));

function processJSON(indent) {
    const input = document.getElementById('json-input');
    const output = document.getElementById('json-output');
    const msg = document.getElementById('msg');

    msg.textContent = '';

    try {
        const value = input.value.trim();
        if (!value) return;

        const obj = JSON.parse(value);
        output.value = JSON.stringify(obj, null, indent);
    } catch (e) {
        msg.textContent = 'Invalid JSON: ' + e.message;
    }
}
