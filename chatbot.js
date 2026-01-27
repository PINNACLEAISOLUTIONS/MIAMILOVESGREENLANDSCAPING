// chatbot.js - Phase 6: Inline styles for guaranteed mobile fullscreen
document.addEventListener('DOMContentLoaded', function () {
    console.log('Chatbot script loaded');

    const chatbotToggleBtn = document.getElementById('chatbot-toggle-btn');
    const chatbotContainer = document.getElementById('chatbot-container');
    const chatbotCloseBtn = document.getElementById('chatbot-close-btn');
    const chatbotHeader = chatbotContainer ? chatbotContainer.querySelector('.chatbot-header') : null;
    const chatbotIframe = chatbotContainer ? chatbotContainer.querySelector('iframe') : null;

    if (!chatbotToggleBtn || !chatbotContainer) {
        console.error('Chatbot elements not found');
        return;
    }

    const isMobile = () => window.innerWidth < 768;

    // --- Helper Functions ---
    function resetSizingStyles() {
        // Only reset dynamic overrides, let CSS handle the rest
        chatbotContainer.style.width = '';
        chatbotContainer.style.height = '';
        chatbotContainer.style.top = '';
        chatbotContainer.style.left = '';
        chatbotContainer.style.bottom = '';
        chatbotContainer.style.transform = '';
        chatbotContainer.style.display = ''; // Let CSS control display: none
    }

    function closeChatbot() {
        console.log('Action: Close Chatbot');
        chatbotContainer.classList.remove('active');
        document.documentElement.classList.remove('chatbot-open');
        document.body.classList.remove('chatbot-open');
        chatbotToggleBtn.setAttribute('aria-expanded', 'false');

        // Clear inline styles after a short delay to allow transition
        setTimeout(resetSizingStyles, 300);
    }

    function openChatbot() {
        console.log('Action: Open Chatbot');
        applySizingStyles();
        // Force redraw/reflow before adding active class for transition
        void chatbotContainer.offsetWidth;
        chatbotContainer.classList.add('active');
        chatbotToggleBtn.setAttribute('aria-expanded', 'true');

        if (isMobile()) {
            document.documentElement.classList.add('chatbot-open');
            document.body.classList.add('chatbot-open');
        }
    }

    function toggleChatbotAction(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        const isActive = chatbotContainer.classList.contains('active');
        if (isActive) {
            closeChatbot();
        } else {
            openChatbot();
        }
    }

    // Initialize - FORCE CLOSED STATE
    // closeChatbot(); // This is now handled at the end of DOMContentLoaded

    // --- Dynamic Viewport Height ---
    function getViewportHeight() {
        return window.visualViewport ? window.visualViewport.height : window.innerHeight;
    }

    function updateVH() {
        const h = getViewportHeight();
        document.documentElement.style.setProperty('--vhpx', `${h}px`);

        // Only update height if active
        if (isMobile() && chatbotContainer.classList.contains('active')) {
            chatbotContainer.style.height = h + 'px';
            chatbotContainer.style.maxHeight = h + 'px';
        }

        // Update debug overlay if active
        const debugOverlay = document.getElementById('chatbot-mobile-debug');
        if (debugOverlay && localStorage.getItem('chatbot_debug') === 'true') {
            const overlayRect = chatbotContainer.getBoundingClientRect();
            const computedStyle = window.getComputedStyle(chatbotContainer);
            debugOverlay.innerHTML = `
                win.size: ${window.innerWidth}x${window.innerHeight}<br>
                vv.size: ${window.visualViewport ? Math.round(window.visualViewport.width) + 'x' + Math.round(window.visualViewport.height) : 'N/A'}<br>
                --vhpx: ${h}px<br>
                container: ${Math.round(overlayRect.width)}x${Math.round(overlayRect.height)}<br>
                pos: ${computedStyle.position}, top: ${computedStyle.top}, bot: ${computedStyle.bottom}<br>
                transform: ${computedStyle.transform !== 'none' ? 'ACTIVE' : 'none'}
            `;
        }
    }

    // Initialize Debug Overlay on Mobile
    if (isMobile()) {
    }
    updateVH();

    // --- Apply Sizing and Iframe Styles (Desktop & Mobile) ---
    function applySizingStyles() {
        const h = getViewportHeight();
        const mobile = isMobile();

        // Common transitions and display
        chatbotContainer.style.display = 'flex';
        chatbotContainer.style.flexDirection = 'column';
        chatbotContainer.style.overflow = 'hidden';
        chatbotContainer.style.boxSizing = 'border-box';
        chatbotContainer.style.zIndex = '10000000';
        chatbotContainer.style.position = 'fixed';
        chatbotContainer.style.transform = 'none';
        chatbotContainer.style.opacity = '1';
        chatbotContainer.style.visibility = 'visible';

        if (mobile) {
            // Mobile Fullscreen Logic (Clean Header)
            chatbotContainer.style.top = '0';
            chatbotContainer.style.left = '0';
            chatbotContainer.style.right = '0';
            chatbotContainer.style.bottom = '0';
            chatbotContainer.style.width = '100vw';
            chatbotContainer.style.height = h + 'px';
            chatbotContainer.style.maxHeight = h + 'px';
            chatbotContainer.style.borderRadius = '0';
            chatbotContainer.style.margin = '0';
            chatbotContainer.style.paddingTop = 'env(safe-area-inset-top)';
            chatbotContainer.style.paddingBottom = 'env(safe-area-inset-bottom)';
            chatbotContainer.style.background = '#000';

            if (chatbotHeader) chatbotHeader.style.display = 'flex';
        } else {
            // Desktop Panel - Let CSS handle it!
            // We clear any leftover mobile inline styles just in case
            chatbotContainer.style.width = '';
            chatbotContainer.style.height = '';
            chatbotContainer.style.top = '';
            chatbotContainer.style.left = '';
            chatbotContainer.style.right = '';
            chatbotContainer.style.bottom = '';
            chatbotContainer.style.borderRadius = '';
            chatbotContainer.style.background = '';
            chatbotContainer.style.boxShadow = '';
            chatbotContainer.style.border = '';
            chatbotContainer.style.display = ''; // Let CSS .active handle display

            if (chatbotHeader) {
                chatbotHeader.style = ''; // Clear header overrides
            }
        }

        // Iframe Logic - Adjust shift to ONLY hide the sidebar (approx 260px)
        if (chatbotIframe) {
            // Updated shift value based on user screenshot showing cut-off content
            const SIDEBAR_PX = 260;
            chatbotIframe.style.border = 'none';
            chatbotIframe.style.display = 'block';
            chatbotIframe.style.padding = '0';
            chatbotIframe.style.height = '100%';
            chatbotIframe.style.flex = '1 1 auto';

            // Refined shift logic
            chatbotIframe.style.width = `calc(100% + ${SIDEBAR_PX}px)`;
            chatbotIframe.style.marginLeft = `-${SIDEBAR_PX}px`;
            chatbotIframe.style.position = 'relative';
            chatbotIframe.style.zIndex = '1';
        }
    }

    // --- Reset Styles ---
    function toggleChatbotAction(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        // Use visibility and active class as dual check
        const isCurrentlyActive = chatbotContainer.classList.contains('active');

        console.log('Toggle Chatbot. Current state active:', isCurrentlyActive);

        if (!isCurrentlyActive) {
            openChatbot();
        } else {
            closeChatbot();
        }
    }
    function openChatbot() {
        console.log('Executing Open Sequence');

        // Ensure child of body for mobile z-index
        if (isMobile() && chatbotContainer.parentElement !== document.body) {
            document.body.appendChild(chatbotContainer);
        }

        applySizingStyles();
        chatbotContainer.classList.add('active');
        chatbotToggleBtn.setAttribute('aria-expanded', 'true');

        if (isMobile()) {
            document.documentElement.classList.add('chatbot-open');
            document.body.classList.add('chatbot-open');
            window.scrollTo(0, 0);
        }
    }

    // Event Listeners
    chatbotToggleBtn.addEventListener('click', toggleChatbotAction);
    chatbotToggleBtn.addEventListener('touchstart', toggleChatbotAction, { passive: false });

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

    // Initialize
    updateVH();
    // Force closed on load
    chatbotContainer.classList.remove('active');
    resetSizingStyles();
});
