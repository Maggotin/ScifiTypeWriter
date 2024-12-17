import { extension_settings, getContext, loadExtensionSettings } from "../../../extensions.js";
import { saveSettingsDebounced } from "../../../../script.js";

const extensionName = "ScifiTypeWriter";
const extensionFolderPath = `scripts/extensions/third-party/${extensionName}`;

// Default settings
const defaultSettings = {
    enabled: false,
    animationSpeed: 30
};

// Initialize settings
async function loadSettings() {
    extension_settings[extensionName] = extension_settings[extensionName] || {};
    if (Object.keys(extension_settings[extensionName]).length === 0) {
        Object.assign(extension_settings[extensionName], defaultSettings);
    }

    $("#typewriter_enabled").prop("checked", extension_settings[extensionName].enabled);
    $("#typewriter_speed").val(extension_settings[extensionName].animationSpeed);
    $("#typewriter_speed_value").text(extension_settings[extensionName].animationSpeed);
}

function typewriterEffect(messageElement) {
    if (!extension_settings[extensionName].enabled) return;

    const text = messageElement.textContent.trim();
    messageElement.textContent = "";
    let index = 0;

    function addChar() {
        const char = document.createElement("span");
        char.classList.add("char");
        char.textContent = "▌";
        messageElement.appendChild(char);
        
        setTimeout(() => {
            char.textContent = text[index];
            char.classList.add("fade-in");
        }, extension_settings[extensionName].animationSpeed);

        index++;
        if (index < text.length) {
            setTimeout(addChar, extension_settings[extensionName].animationSpeed);
        }
    }

    setTimeout(addChar, 1000);
}

// Event Handlers
function onEnabledInput(event) {
    extension_settings[extensionName].enabled = $(event.target).prop("checked");
    saveSettingsDebounced();
}

function onSpeedInput(event) {
    const value = Number($(event.target).val());
    extension_settings[extensionName].animationSpeed = value;
    $("#typewriter_speed_value").text(value);
    saveSettingsDebounced();
}

// Message Observer
const messageObserver = new MutationObserver((mutations) => {
    if (!extension_settings[extensionName].enabled) return;
    
    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
            if (node.classList?.contains('mes') && !node.getAttribute('is_user')) {
                const messageText = node.querySelector('.mes_text');
                if (messageText) {
                    typewriterEffect(messageText);
                }
            }
        });
    });
});

// Initialize
jQuery(async () => {
    const settingsHtml = await $.get(`${extensionFolderPath}/typewriter.html`);
    $("#extensions_settings2").append(settingsHtml);

    $("#typewriter_enabled").on("input", onEnabledInput);
    $("#typewriter_speed").on("input", onSpeedInput);

    await loadSettings();

    // Start observing chat
    const chat = document.getElementById('chat');
    if (chat) {
        messageObserver.observe(chat, { childList: true, subtree: true });
    }
});
