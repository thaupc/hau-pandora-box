document.addEventListener('DOMContentLoaded', () => {
    const toolsGrid = document.getElementById('tools-grid');
    const searchInput = document.getElementById('search-input');
    const addToolBtn = document.getElementById('add-tool-btn');
    const toolModal = document.getElementById('tool-modal');
    const toolForm = document.getElementById('tool-form');
    const cancelBtn = document.getElementById('cancel-btn');
    const deleteBtn = document.getElementById('delete-tool-btn');
    const modalTitle = document.getElementById('modal-title');
    const toolIdInput = document.getElementById('tool-id');
    const toolNameInput = document.getElementById('tool-name');
    const toolUrlInput = document.getElementById('tool-url');

    let tools = [];

    const settingsBtn = document.getElementById('settings-btn');

    // Default tools
    const defaultTools = [
        { id: '1', name: 'JSON Formatter', url: chrome.runtime.getURL('tools/json-formatter.html'), icon: 'tools' },
        { id: '2', name: 'Character Count', url: chrome.runtime.getURL('tools/char-count.html'), icon: 'type' },
        { id: '3', name: 'Translator', url: chrome.runtime.getURL('tools/translator.html'), icon: 'globe' },
        { id: '4', name: 'Hex Converter', url: chrome.runtime.getURL('tools/hex-converter.html'), icon: 'hash' }
    ];

    // Load tools
    chrome.storage.local.get(['tools'], (result) => {
        // If force reset needed, can uncomment next line
        // tools = defaultTools; saveTools(); return renderTools(tools);
        // FORCE ADD HEX IF MISSING (user update)
        if (result.tools && result.tools.length > 0) {
            tools = result.tools;
            // Basic check if user has old default list without hex
            const hasHex = tools.some(t => t.name === 'Hex Converter');
            if (!hasHex) {
                // Push the new tool if it is strictly missing and likely a default user?
                // Or just let user add it manually? User asked to "implement feature", implied it should be available.
                // Let's force add it for now if it's not custom deleted.
                // Actually safest is if user has default tools, update 'em.
                // But let's just append it for this "update".
                tools.push({ id: '4', name: 'Hex Converter', url: chrome.runtime.getURL('tools/hex-converter.html'), icon: 'hash' });
                saveTools();
            }
        } else {
            tools = defaultTools;
            saveTools();
        }
        renderTools(tools);
    });

    // Render tools
    function renderTools(toolsToRender) {
        toolsGrid.innerHTML = '';
        toolsToRender.forEach(tool => {
            const card = document.createElement('div');
            card.className = 'tool-card';
            card.onclick = (e) => {
                // Prevent click if clicking edit button
                if (e.target.closest('.edit-btn')) return;
                // Open in same tab so back button works
                window.location.href = tool.url;
            };

            const imgOrIcon = document.createElement('div');
            let faviconUrl;

            // Check if internal tool
            if (tool.url.startsWith('chrome-extension://') || tool.icon) {
                // Internal tool or has specific icon set
                imgOrIcon.className = 'tool-initial';
                if (tool.name.includes('JSON')) {
                    imgOrIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`;
                } else if (tool.name.includes('Character') || tool.name.includes('Count')) {
                    imgOrIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>`;
                } else if (tool.name.includes('Translator')) {
                    imgOrIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`;
                } else if (tool.name.includes('Hex')) {
                    imgOrIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>`;
                } else {
                    imgOrIcon.textContent = tool.name.charAt(0);
                }
            } else {
                // External tool - use favicon
                let domain;
                try {
                    domain = new URL(tool.url).hostname;
                } catch (e) {
                    domain = 'example.com';
                }
                const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
                const img = document.createElement('img');
                img.src = faviconUrl;
                img.className = 'tool-icon';
                img.alt = tool.name;
                imgOrIcon.appendChild(img);
            }

            // Edit button (Re-added)
            const editBtn = document.createElement('button');
            editBtn.className = 'edit-btn';
            editBtn.title = 'Edit Tool';
            editBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;
            editBtn.onclick = (e) => {
                e.stopPropagation();
                openEditModal(tool);
            };

            const name = document.createElement('div');
            name.className = 'tool-name';
            name.textContent = tool.name;

            card.appendChild(editBtn);
            card.appendChild(imgOrIcon);
            card.appendChild(name);
            toolsGrid.appendChild(card);
        });
    }

    // Save tools to storage
    function saveTools() {
        chrome.storage.local.set({ tools: tools });
    }

    // Open/Close Modal
    function openModal() {
        toolModal.classList.remove('hidden');
        toolNameInput.focus();
    }

    function closeModal() {
        toolModal.classList.add('hidden');
        toolForm.reset();
        toolIdInput.value = '';
        deleteBtn.classList.add('hidden');
        modalTitle.textContent = 'Add New Tool';
    }

    function openEditModal(tool) {
        modalTitle.textContent = 'Edit Tool';
        toolIdInput.value = tool.id;
        toolNameInput.value = tool.name;
        toolUrlInput.value = tool.url;
        deleteBtn.classList.remove('hidden');
        openModal();
    }

    // Event Listeners
    settingsBtn.addEventListener('click', () => {
        window.location.href = 'options.html';
    });

    addToolBtn.addEventListener('click', () => {
        openModal();
    });

    cancelBtn.addEventListener('click', closeModal);

    // Close on click outside
    toolModal.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            closeModal();
        }
    });

    // Form Submit
    toolForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = toolIdInput.value;
        const name = toolNameInput.value;
        let url = toolUrlInput.value;

        if (!url.startsWith('http')) {
            url = 'https://' + url;
        }

        if (id) {
            // Edit
            const index = tools.findIndex(t => t.id === id);
            if (index !== -1) {
                tools[index] = { id, name, url };
            }
        } else {
            // Add
            const newTool = {
                id: Date.now().toString(),
                name,
                url
            };
            tools.push(newTool);
        }

        saveTools();
        renderTools(tools);
        // Clear search if it exists to show new item? 
        // Or keep search? Let's clear search for clarity.
        searchInput.value = '';
        closeModal();
    });

    // Delete
    deleteBtn.addEventListener('click', () => {
        const id = toolIdInput.value;
        if (id) {
            if (confirm('Are you sure you want to delete this tool?')) {
                tools = tools.filter(t => t.id !== id);
                saveTools();
                renderTools(tools);
                searchInput.value = '';
                closeModal();
            }
        }
    });

    // Search
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = tools.filter(tool =>
            tool.name.toLowerCase().includes(query) ||
            tool.url.toLowerCase().includes(query)
        );
        renderTools(filtered);
    });
});
