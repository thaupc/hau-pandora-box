# Hau Pandora Box

**Hau Pandora Box** is the ultimate productivity suite for Chrome, designed to streamline your workflow by fusing essential developer tools, smart navigation shortcuts, and classic browser behaviors into one powerful extension.

## 🚀 Key Features

### 1. ⚡ Smart Jira Navigation (Omnibox)
Navigate to your Jira tickets instantly from the address bar without touching your mouse.
- **Type `hn` + Tab/Space** to activate.
- **`hn 123`**: Goes to `DEFAULT_KEY-123` (e.g., `EM-123`).
- **`hn PROJ 123`**: Goes to `PROJ-123` (overrides default project).
- **`hn search terms`**: Performs a JQL text search in Jira.
- **Fallback**: Defaults to Google search if no match found.
- **Configurable**: Set your Jira Subdomain and Default Project Key in Options.

### 2. 🧰 Developer Toolbox
Replaces your New Tab page with a clean, professional dashboard containing your essential tools.
- **Built-in Tools**:
  - **JSON Formatter**: Prettify and validate JSON instantly.
  - **Hex Converter**: Convert between Hex, RGB, and other color formats.
  - **Character Count**: Track text length and detailed statistics.
  - **Translator**: Quick language translation utilities.
- **Custom Shortcuts**: Add your own frequently visited websites or tools as quick-access tiles.
- **Search**: Instantly filter through your tools with the integrated search bar.

### 3. 🔙 Classic Backspace Navigation
Miss the old "Backspace to go Back" feature? It's back!
- Pressing **Backspace** navigates to the previous page (History Back).
- Smart detection prevents accidental navigation when typing in text fields or forms.

### 4. ⚙️ Customizable
- **Options Page**: Toggle features on/off (like Backspace navigation or Jira redirect) and configure your specific Jira environment settings.

## 📦 Installation

1. Clone or download this repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Toggle **Developer mode** in the top right corner.
4. Click **Load unpacked**.
5. Select the `hau-pandora-box` directory.

## 🛠 Usage

- **New Tab**: Just open a new tab to access your Toolbox.
- **Quick Access**: Click the extension icon in the toolbar to open the Toolbox in a popup/tab.
- **Settings**: Click the gear icon in the Toolbox to configure your Jira project keys and toggle features.

## 🔐 Privacy
This extension operates entirely locally. Your custom shortcuts and settings are stored in your browser's sync storage and are never sent to external servers.

---
*Elevate your browsing efficiency with Hau Pandora Box.*
