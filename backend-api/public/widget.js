(function() {
    'use strict';

    // Widget configuration
    const WIDGET_CONFIG = {
        apiBaseUrl: window.WIDGET_API_BASE_URL || 'http://localhost:8000/api',
        widgetId: window.WIDGET_ID || null,
        position: window.WIDGET_POSITION || 'bottom-right',
        theme: window.WIDGET_THEME || 'light',
        autoOpen: window.WIDGET_AUTO_OPEN || false,
        showOnPages: window.WIDGET_SHOW_ON_PAGES || [],
        hideOnPages: window.WIDGET_HIDE_ON_PAGES || []
    };

    // Widget state
    let widgetState = {
        isOpen: false,
        isLoaded: false,
        sessionId: null,
        messages: [],
        isTyping: false
    };

    // Create widget HTML structure
    function createWidgetHTML() {
        return `
            <div id="chat-widget" class="chat-widget chat-widget-${WIDGET_CONFIG.position} chat-widget-${WIDGET_CONFIG.theme}">
                <div id="chat-widget-button" class="chat-widget-button">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="currentColor"/>
                    </svg>
                </div>
                <div id="chat-widget-container" class="chat-widget-container" style="display: none;">
                    <div class="chat-widget-header">
                        <div class="chat-widget-title">Chat Support</div>
                        <button id="chat-widget-close" class="chat-widget-close">×</button>
                    </div>
                    <div id="chat-widget-messages" class="chat-widget-messages"></div>
                    <div class="chat-widget-input-container">
                        <input type="text" id="chat-widget-input" class="chat-widget-input" placeholder="Type your message...">
                        <button id="chat-widget-send" class="chat-widget-send">Send</button>
                    </div>
                </div>
            </div>
        `;
    }

    // Create widget CSS
    function createWidgetCSS() {
        const css = `
            .chat-widget {
                position: fixed;
                z-index: 9999;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            .chat-widget-bottom-right {
                bottom: 20px;
                right: 20px;
            }

            .chat-widget-bottom-left {
                bottom: 20px;
                left: 20px;
            }

            .chat-widget-button {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: #007bff;
                color: white;
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
                transition: all 0.3s ease;
            }

            .chat-widget-button:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 16px rgba(0, 123, 255, 0.4);
            }

            .chat-widget-container {
                position: absolute;
                bottom: 80px;
                right: 0;
                width: 350px;
                height: 500px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }

            .chat-widget-header {
                background: #007bff;
                color: white;
                padding: 16px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .chat-widget-title {
                font-weight: 600;
                font-size: 16px;
            }

            .chat-widget-close {
                background: none;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .chat-widget-messages {
                flex: 1;
                padding: 16px;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .chat-message {
                max-width: 80%;
                padding: 12px 16px;
                border-radius: 18px;
                font-size: 14px;
                line-height: 1.4;
            }

            .chat-message-user {
                background: #007bff;
                color: white;
                align-self: flex-end;
                border-bottom-right-radius: 4px;
            }

            .chat-message-assistant {
                background: #f1f3f5;
                color: #333;
                align-self: flex-start;
                border-bottom-left-radius: 4px;
            }

            .chat-widget-input-container {
                padding: 16px;
                border-top: 1px solid #e9ecef;
                display: flex;
                gap: 8px;
            }

            .chat-widget-input {
                flex: 1;
                padding: 12px 16px;
                border: 1px solid #dee2e6;
                border-radius: 24px;
                outline: none;
                font-size: 14px;
            }

            .chat-widget-input:focus {
                border-color: #007bff;
            }

            .chat-widget-send {
                background: #007bff;
                color: white;
                border: none;
                padding: 12px 20px;
                border-radius: 24px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
            }

            .chat-widget-send:hover {
                background: #0056b3;
            }

            .chat-widget-send:disabled {
                background: #6c757d;
                cursor: not-allowed;
            }

            .typing-indicator {
                display: flex;
                align-items: center;
                gap: 4px;
                padding: 12px 16px;
                background: #f1f3f5;
                border-radius: 18px;
                align-self: flex-start;
                border-bottom-left-radius: 4px;
            }

            .typing-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #6c757d;
                animation: typing 1.4s infinite ease-in-out;
            }

            .typing-dot:nth-child(1) { animation-delay: -0.32s; }
            .typing-dot:nth-child(2) { animation-delay: -0.16s; }

            @keyframes typing {
                0%, 80%, 100% { transform: scale(0); }
                40% { transform: scale(1); }
            }

            /* Dark theme */
            .chat-widget-dark .chat-widget-container {
                background: #2d3748;
                color: white;
            }

            .chat-widget-dark .chat-message-assistant {
                background: #4a5568;
                color: white;
            }

            .chat-widget-dark .chat-widget-input-container {
                border-top-color: #4a5568;
            }

            .chat-widget-dark .chat-widget-input {
                background: #4a5568;
                border-color: #4a5568;
                color: white;
            }

            .chat-widget-dark .chat-widget-input::placeholder {
                color: #a0aec0;
            }
        `;

        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    }

    // API functions
    async function createChatSession() {
        try {
            const response = await fetch(`${WIDGET_CONFIG.apiBaseUrl}/chat/sessions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    widget_id: WIDGET_CONFIG.widgetId,
                    metadata: {
                        url: window.location.href,
                        userAgent: navigator.userAgent,
                        timestamp: new Date().toISOString()
                    }
                })
            });

            if (response.ok) {
                const data = await response.json();
                widgetState.sessionId = data.id;
                return data;
            }
        } catch (error) {
            console.error('Failed to create chat session:', error);
        }
        return null;
    }

    async function sendMessage(content) {
        if (!widgetState.sessionId) {
            await createChatSession();
        }

        try {
            const response = await fetch(`${WIDGET_CONFIG.apiBaseUrl}/chat/sessions/${widgetState.sessionId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: content,
                    type: 'text'
                })
            });

            if (response.ok) {
                const data = await response.json();
                return data;
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        }
        return null;
    }

    // UI functions
    function addMessage(content, role, type = 'text') {
        const messagesContainer = document.getElementById('chat-widget-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message chat-message-${role}`;
        messageDiv.textContent = content;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        widgetState.messages.push({ content, role, type, timestamp: new Date() });
    }

    function showTypingIndicator() {
        if (widgetState.isTyping) return;

        widgetState.isTyping = true;
        const messagesContainer = document.getElementById('chat-widget-messages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function hideTypingIndicator() {
        widgetState.isTyping = false;
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    function toggleWidget() {
        const container = document.getElementById('chat-widget-container');
        const button = document.getElementById('chat-widget-button');

        if (widgetState.isOpen) {
            container.style.display = 'none';
            widgetState.isOpen = false;
        } else {
            container.style.display = 'flex';
            widgetState.isOpen = true;

            if (!widgetState.isLoaded) {
                initializeChat();
                widgetState.isLoaded = true;
            }

            // Focus input
            setTimeout(() => {
                document.getElementById('chat-widget-input').focus();
            }, 100);
        }
    }

    async function initializeChat() {
        const session = await createChatSession();
        if (session && session.messages && session.messages.length > 0) {
            session.messages.forEach(message => {
                addMessage(message.content, message.role, message.type);
            });
        }
    }

    async function handleSendMessage() {
        const input = document.getElementById('chat-widget-input');
        const sendButton = document.getElementById('chat-widget-send');
        const content = input.value.trim();

        if (!content) return;

        // Add user message to UI
        addMessage(content, 'user');
        input.value = '';

        // Disable input while processing
        input.disabled = true;
        sendButton.disabled = true;
        showTypingIndicator();

        // Send message to API
        const response = await sendMessage(content);

        hideTypingIndicator();

        if (response && response.content) {
            addMessage(response.content, 'assistant');
        } else {
            addMessage('Sorry, I encountered an error. Please try again.', 'assistant');
        }

        // Re-enable input
        input.disabled = false;
        sendButton.disabled = false;
        input.focus();
    }

    // Check if widget should be shown on current page
    function shouldShowWidget() {
        const currentPath = window.location.pathname;

        // Check hide pages
        if (WIDGET_CONFIG.hideOnPages.length > 0) {
            for (const page of WIDGET_CONFIG.hideOnPages) {
                if (currentPath.includes(page)) {
                    return false;
                }
            }
        }

        // Check show pages
        if (WIDGET_CONFIG.showOnPages.length > 0) {
            for (const page of WIDGET_CONFIG.showOnPages) {
                if (currentPath.includes(page)) {
                    return true;
                }
            }
            return false;
        }

        return true;
    }

    // Initialize widget
    function initWidget() {
        if (!WIDGET_CONFIG.widgetId) {
            console.error('Widget ID not provided');
            return;
        }

        if (!shouldShowWidget()) {
            return;
        }

        // Create CSS
        createWidgetCSS();

        // Create HTML
        const widgetHTML = createWidgetHTML();
        document.body.insertAdjacentHTML('beforeend', widgetHTML);

        // Add event listeners
        document.getElementById('chat-widget-button').addEventListener('click', toggleWidget);
        document.getElementById('chat-widget-close').addEventListener('click', toggleWidget);
        document.getElementById('chat-widget-send').addEventListener('click', handleSendMessage);

        const input = document.getElementById('chat-widget-input');
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleSendMessage();
            }
        });

        // Auto-open if configured
        if (WIDGET_CONFIG.autoOpen) {
            setTimeout(toggleWidget, 1000);
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWidget);
    } else {
        initWidget();
    }
})();
