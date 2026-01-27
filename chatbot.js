// chatbot.js - Cleaned up version v22
document.addEventListener('DOMContentLoaded', function () {
    console.log('Chatbot script loaded v22');

    const chatbotToggleBtn = document.getElementById('chatbot-toggle-btn');
    const chatbotContainer = document.getElementById('chatbot-container');
    const chatbotCloseBtn = document.getElementById('chatbot-close-btn');
    const chatbotIframe = chatbotContainer ? chatbotContainer.querySelector('iframe') : null;

    if (!chatbotToggleBtn || !chatbotContainer) {
        console.error('Chatbot elements not found');
        return;
    }

    const isMobile = () => window.innerWidth < 768;

    function applySizingStyles() {
        const h = window.visualViewport ? window.visualViewport.height : window.innerHeight;
        const mobile = isMobile();

        // Common styles
        chatbotContainer.style.display = 'flex';
        chatbotContainer.style.zIndex = '10000000';
        chatbotContainer.style.position = 'fixed';
        chatbotContainer.style.visibility = 'visible';
        chatbotContainer.style.opacity = '1';

        if (mobile) {
            chatbotContainer.style.inset = '0';
            chatbotContainer.style.width = '100vw';
            chatbotContainer.style.height = h + 'px';
            chatbotContainer.style.borderRadius = '0';
        } else {
            // Desktop sizing is handled by CSS (350x520)
            // But we clear mobile overrides
            chatbotContainer.style.top = '';
            chatbotContainer.style.left = '';
            chatbotContainer.style.right = '';
            chatbotContainer.style.bottom = '';
            chatbotContainer.style.width = '';
            chatbotContainer.style.height = '';
            chatbotContainer.style.borderRadius = '';
        }
    }

    function resetSizingStyles() {
        chatbotContainer.style.width = '';
        chatbotContainer.style.height = '';
        chatbotContainer.style.top = '';
        chatbotContainer.style.left = '';
        chatbotContainer.style.right = '';
        chatbotContainer.style.bottom = '';
        chatbotContainer.style.display = 'none';
    }

    function openChatbot() {
        console.log('Action: Open Chatbot');
        applySizingStyles();
        chatbotContainer.classList.add('active');
        chatbotToggleBtn.setAttribute('aria-expanded', 'true');

        if (isMobile()) {
            document.documentElement.classList.add('chatbot-open');
            document.body.classList.add('chatbot-open');
        }
    }

    function closeChatbot() {
        console.log('Action: Close Chatbot');
        chatbotContainer.classList.remove('active');
        document.documentElement.classList.remove('chatbot-open');
        document.body.classList.remove('chatbot-open');
        chatbotToggleBtn.setAttribute('aria-expanded', 'false');

        setTimeout(resetSizingStyles, 300);
    }

    function toggleChatbotAction(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (chatbotContainer.classList.contains('active')) {
            closeChatbot();
        } else {
            openChatbot();
        }
    }

    // Event Listeners
    chatbotToggleBtn.addEventListener('click', toggleChatbotAction);
    if (chatbotCloseBtn) {
        chatbotCloseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeChatbot();
        });
    }

    // Close on click outside (Desktop)
    document.addEventListener('click', (e) => {
        if (!isMobile() &&
            chatbotContainer.classList.contains('active') &&
            !chatbotContainer.contains(e.target) &&
            !chatbotToggleBtn.contains(e.target)) {
            closeChatbot();
        }
    });

    // FORCE CLOSED ON LOAD
    chatbotContainer.classList.remove('active');
    resetSizingStyles();
});
