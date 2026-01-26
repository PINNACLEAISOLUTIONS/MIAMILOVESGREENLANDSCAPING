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

    // --- Dynamic Viewport Height ---
    function getViewportHeight() {
        return window.visualViewport ? window.visualViewport.height : window.innerHeight;
    }

    function updateVH() {
        const h = getViewportHeight();
        document.documentElement.style.setProperty('--vhpx', `${h}px`);

        // If chatbot is open on mobile, update the height inline
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
        let debugOverlay = document.getElementById('chatbot-mobile-debug');
        if (!debugOverlay) {
            debugOverlay = document.createElement('div');
            debugOverlay.id = 'chatbot-mobile-debug';
            document.body.appendChild(debugOverlay);
        }
        if (localStorage.getItem('chatbot_debug') === 'true') {
            document.body.classList.add('chatbot-debug-active');
        }
    }

    window.addEventListener('resize', updateVH);
    window.addEventListener('orientationchange', updateVH);
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', updateVH);
        window.visualViewport.addEventListener('scroll', updateVH);
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
            // Desktop Panel - FIXED OVERLAP ISSUE
            const panelHeight = Math.min(800, h * 0.85);
            chatbotContainer.style.top = 'auto';
            chatbotContainer.style.bottom = '100px'; // Lifted above the toggle button
            chatbotContainer.style.left = '40px';
            chatbotContainer.style.right = 'auto';
            chatbotContainer.style.width = '450px';
            chatbotContainer.style.height = panelHeight + 'px';
            chatbotContainer.style.maxHeight = '90vh';
            chatbotContainer.style.borderRadius = '16px';
            chatbotContainer.style.background = '#111';
            chatbotContainer.style.boxShadow = '0 10px 40px rgba(0,0,0,0.8)';
            chatbotContainer.style.border = '1px solid #4CAF50';

            // Header: Keep it anchored at top, no shift
            if (chatbotHeader) {
                chatbotHeader.style.display = 'flex';
                chatbotHeader.style.background = '#4CAF50';
                chatbotHeader.style.padding = '15px';
                chatbotHeader.style.width = '100%';
                chatbotHeader.style.boxSizing = 'border-box';
                chatbotHeader.style.zIndex = '10';
            }
        }

        // Iframe Logic - Only the Iframe shifts, not the whole container
        if (chatbotIframe) {
            const SIDEBAR_PX = 320; // Correct width for the internal app sidebar
            chatbotIframe.style.border = 'none';
            chatbotIframe.style.display = 'block';
            chatbotIframe.style.padding = '0';
            chatbotIframe.style.height = '100%';
            chatbotIframe.style.flex = '1 1 auto';

            // Hide ONLY the iframe's left side
            chatbotIframe.style.width = `calc(100% + ${SIDEBAR_PX}px)`;
            chatbotIframe.style.marginLeft = `-${SIDEBAR_PX}px`;
            chatbotIframe.style.position = 'relative';
            chatbotIframe.style.zIndex = '1';
        }
    }

    // --- Reset Styles ---
    function resetSizingStyles() {
        chatbotContainer.style.display = 'none';
        chatbotContainer.style.visibility = 'hidden';
        chatbotContainer.style.opacity = '0';

        // Remove all inline overrides
        const props = ['position', 'top', 'left', 'right', 'bottom', 'width', 'height', 'maxHeight', 'borderRadius', 'margin', 'paddingTop', 'paddingBottom', 'background', 'zIndex', 'flexDirection', 'overflow', 'boxSizing', 'transform', 'boxShadow'];
        props.forEach(p => chatbotContainer.style[p] = '');

        if (chatbotHeader) {
            chatbotHeader.style.flex = '';
            chatbotHeader.style.width = '';
            chatbotHeader.style.display = '';
        }

        if (chatbotIframe) {
            const iProps = ['flex', 'width', 'height', 'minHeight', 'border', 'display', 'margin', 'marginLeft', 'padding', 'maxWidth'];
            iProps.forEach(p => chatbotIframe.style[p] = '');
        }
    }

    // Robust Toggle Function
    function toggleChatbotAction(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        // Use visibility and active class as dual check
        const isCurrentlyActive = chatbotContainer.classList.contains('active') &&
            chatbotContainer.style.display === 'flex';

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

    function closeChatbot() {
        console.log('Executing Close Sequence');
        chatbotContainer.classList.remove('active');
        document.documentElement.classList.remove('chatbot-open');
        document.body.classList.remove('chatbot-open');
        chatbotToggleBtn.setAttribute('aria-expanded', 'false');

        resetSizingStyles();
    }

    chatbotToggleBtn.addEventListener('click', toggleChatbotAction);
    chatbotToggleBtn.addEventListener('touchstart', toggleChatbotAction, { passive: false });

    if (chatbotCloseBtn) {
        chatbotCloseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeChatbot();
        });
    }

    // Desktop: Close on click outside
    document.addEventListener('click', function (e) {
        if (!isMobile() &&
            chatbotContainer.classList.contains('active') &&
            !chatbotContainer.contains(e.target) &&
            !chatbotToggleBtn.contains(e.target)) {
            console.log('Click outside detected. Closing.');
            closeChatbot();
        }
    });
});
