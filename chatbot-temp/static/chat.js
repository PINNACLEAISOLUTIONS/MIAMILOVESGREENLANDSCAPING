document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.querySelector('.status-text');
    const historyList = document.getElementById('history-list');
    const newChatBtn = document.getElementById('new-chat-btn');

    const micBtn = document.getElementById('mic-btn');
    const hdToggleBtn = document.getElementById('hd-toggle-btn');
    const autoSpeakToggle = document.getElementById('auto-speak-toggle');
    const voiceModeBtn = document.getElementById('voice-mode-btn');

    // --- Mobile Viewport and State Management ---
    const DEBUG_MOBILE = false; // Set to true for debugging
    let isChatOpen = true;
    let debugMode = false;

    // --- Voice State ---
    let useHDMode = false; // HD = Groq Whisper, STD = Browser API
    let autoSpeak = false;
    let isSpeaking = false;
    let currentSpeakingMsgId = null;
    let voiceModeActive = false; // Full voice mode with ElevenLabs TTS
    let currentAudio = null; // Current audio element for ElevenLabs playback

    function setVH() {
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        if (DEBUG_MOBILE) {
            console.log('--- Chatbot Mobile Debug ---');
            console.log('window.innerHeight:', window.innerHeight);
        }
    }

    function lockBodyScroll() {
        if (window.innerWidth < 768) {
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
            document.body.style.height = '100dvh';
        }
    }

    function unlockBodyScroll() {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.height = '';
    }

    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);
    setVH();
    lockBodyScroll();

    // --- Session Persistence ---
    let currentSessionId = localStorage.getItem('chatbot_session_id');

    // --- Speech Recognition Setup (Browser API - STD Mode) ---
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition = null;
    let isRecording = false;

    // --- MediaRecorder for HD Mode (Groq Whisper) ---
    let mediaRecorder = null;
    let audioChunks = [];

    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US';
        recognition.interimResults = true;

        recognition.onstart = () => {
            isRecording = true;
            micBtn.classList.add('recording');
        };

        recognition.onend = () => {
            isRecording = false;
            micBtn.classList.remove('recording');
        };

        recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0].transcript)
                .join('');

            console.log("STT (STD) result:", transcript, "final:", event.results[0].isFinal);

            if (event.results[0].isFinal) {
                userInput.value = transcript;
                userInput.dispatchEvent(new Event('input'));

                // Auto-submit after voice input
                console.log("Triggering auto-send for STT result");
                stopListening(); // Force stop before sending

                // Add a small delay to ensure UI is updated
                setTimeout(() => {
                    if (userInput.value.trim().length > 0) {
                        console.log("Auto-sending message:", userInput.value.trim());
                        sendMessage();
                    }
                }, 300);
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            isRecording = false;
            micBtn.classList.remove('recording');
        };
    }

    // --- HD Toggle Button ---
    if (hdToggleBtn) {
        hdToggleBtn.addEventListener('click', () => {
            useHDMode = !useHDMode;
            hdToggleBtn.textContent = useHDMode ? 'HD' : 'STD';
            hdToggleBtn.classList.toggle('hd-active', useHDMode);
            hdToggleBtn.title = useHDMode ? 'HD Mode (Groq Whisper)' : 'Standard Mode (Browser API)';
        });
    }

    // --- Auto-Speak Toggle ---
    if (autoSpeakToggle) {
        autoSpeakToggle.addEventListener('change', (e) => {
            autoSpeak = e.target.checked;
        });
    }

    // --- Microphone Button Handler ---
    if (micBtn) {
        micBtn.addEventListener('click', () => {
            if (isRecording) {
                stopListening();
            } else {
                startListening();
            }
        });
    }

    async function startListening() {
        // Interruption logic: Stop any ongoing speech when user starts talking
        stopSpeakingElevenLabs();
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();

        if (useHDMode) {
            // HD Mode: Record audio and send to Groq Whisper
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
                audioChunks = [];

                mediaRecorder.ondataavailable = (event) => {
                    audioChunks.push(event.data);
                };

                mediaRecorder.onstop = async () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                    const formData = new FormData();
                    formData.append('audio', audioBlob, 'recording.webm');

                    micBtn.classList.add('processing');

                    try {
                        const response = await fetch('/api/transcribe', {
                            method: 'POST',
                            body: formData
                        });
                        const data = await response.json();
                        if (data.success && data.text) {
                            userInput.value = data.text;
                            userInput.dispatchEvent(new Event('input'));
                            setTimeout(() => sendMessage(), 100);
                        } else {
                            console.error('Transcription failed:', data.error);
                            addErrorMessage('Transcription failed: ' + (data.error || 'Unknown error'));
                        }
                    } catch (err) {
                        console.error('Transcription error:', err);
                        addErrorMessage('Failed to transcribe audio');
                    }

                    micBtn.classList.remove('processing');
                    stream.getTracks().forEach(track => track.stop());
                };

                isRecording = true;
                micBtn.classList.add('recording');
                mediaRecorder.start();

                // Auto-stop after 30 seconds
                setTimeout(() => {
                    if (mediaRecorder && mediaRecorder.state === 'recording') {
                        stopListening();
                    }
                }, 30000);

            } catch (err) {
                console.error('Microphone error:', err);
                addErrorMessage('Could not access microphone. Please check permissions.');
            }
        } else {
            // STD Mode: Use browser Speech Recognition API
            if (recognition) {
                recognition.start();
            } else {
                alert("Your browser does not support Speech-to-Text. Please use Chrome, Edge, or Safari.");
            }
        }
    }

    function stopListening() {
        if (useHDMode && mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            isRecording = false;
            micBtn.classList.remove('recording');
        } else if (recognition) {
            recognition.stop();
        }
    }

    // --- Text-to-Speech Functions ---
    function speakText(text, msgId) {
        console.log('Browser TTS: speakText called with', text.substring(0, 50) + '...');

        if (!('speechSynthesis' in window)) {
            console.warn('Speech synthesis not supported');
            return;
        }

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        // Clean text for speech (remove markdown, links, etc.)
        const cleanText = text
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove markdown links
            .replace(/[#*_`~]/g, '') // Remove markdown formatting
            .replace(/<[^>]+>/g, '') // Remove HTML tags
            .replace(/\n+/g, '. '); // Replace newlines with pauses

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        // Try to use a natural voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v =>
            v.name.includes('Google') ||
            v.name.includes('Samantha') ||
            v.name.includes('Daniel') ||
            v.name.includes('Microsoft')
        );
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        utterance.onstart = () => {
            isSpeaking = true;
            currentSpeakingMsgId = msgId;
            updateSpeakButton(msgId, true);
        };

        utterance.onend = () => {
            console.log("Browser TTS ended");
            isSpeaking = false;
            currentSpeakingMsgId = null;
            updateSpeakButton(msgId, false);

            // Auto-listen trigger
            if (voiceModeActive && !isRecording) {
                console.log("Auto-listen: Starting mic after browser TTS");
                startListening();
            }
        };

        utterance.onerror = () => {
            isSpeaking = false;
            currentSpeakingMsgId = null;
            updateSpeakButton(msgId, false);
        };

        window.speechSynthesis.speak(utterance);
    }

    function stopSpeaking() {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            isSpeaking = false;
            if (currentSpeakingMsgId) {
                updateSpeakButton(currentSpeakingMsgId, false);
            }
            currentSpeakingMsgId = null;
        }
    }

    function updateSpeakButton(msgId, speaking) {
        const btn = document.querySelector(`[data-msg-id="${msgId}"] .speak-btn`);
        if (btn) {
            btn.classList.toggle('speaking', speaking);
            btn.innerHTML = speaking ? getSpeakingIcon() : getSpeakerIcon();
        }
    }

    function getSpeakerIcon() {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
        </svg>`;
    }

    function getSpeakingIcon() {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="6" width="12" height="12" rx="2"/>
        </svg>`;
    }

    // Load voices when available
    if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = () => {
            window.speechSynthesis.getVoices();
        };
    }

    // --- Voice Mode Button Handler (ElevenLabs TTS with browser fallback) ---
    let elevenLabsAvailable = false; // Track if ElevenLabs is configured

    if (voiceModeBtn) {
        voiceModeBtn.addEventListener('click', async () => {
            voiceModeActive = !voiceModeActive;
            voiceModeBtn.classList.toggle('active', voiceModeActive);

            // Update button text
            const voiceText = voiceModeBtn.querySelector('.voice-text');
            if (voiceText) {
                voiceText.textContent = voiceModeActive ? 'Voice ON' : 'Voice Mode';
            }

            if (voiceModeActive) {
                // Check if ElevenLabs is available (only once per session)
                try {
                    const statusRes = await fetch('/api/status');
                    const status = await statusRes.json();
                    elevenLabsAvailable = status.voice_agent && status.voice_agent.available;

                    if (elevenLabsAvailable) {
                        console.log('Voice mode: ElevenLabs/Google TTS available');
                    } else {
                        console.log('Voice mode: Using browser TTS (no API keys configured)');
                    }
                } catch (err) {
                    console.warn('Voice status check failed, using browser TTS');
                    elevenLabsAvailable = false;
                }

                // Enable auto-speak
                autoSpeak = true;

                // Speak short status when voice mode activates (Interruption-friendly)
                speakWithElevenLabs("Voice mode on. How can I help you?", null);
            } else {
                // Stop any current playback
                stopSpeakingElevenLabs();
                autoSpeak = false;
            }
        });
    }

    // --- ElevenLabs TTS Functions ---
    async function speakWithElevenLabs(text, msgId) {
        // If no API keys, use browser TTS immediately (saves API calls)
        if (!elevenLabsAvailable) {
            console.log('Using browser TTS (no API keys configured)');
            speakText(text, msgId);
            return;
        }

        try {
            console.log('Calling ElevenLabs TTS API...');
            const response = await fetch('/api/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: text, voice: 'josh' })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.warn('ElevenLabs TTS failed:', response.status, errorText);

                // If blocked (401 Unusual Activity) or Server Error (500), disable for this session
                if (response.status === 401 || response.status === 500) {
                    console.error('Premium Voice blocked or failing. Falling back to browser TTS permanently for this session.');
                    elevenLabsAvailable = false;
                }

                speakText(text, msgId); // Fallback to browser
                return;
            }

            const data = await response.json();
            console.log('TTS response:', data.success ? 'success' : 'failed', 'provider:', data.provider);

            if (data.success && data.audio_base64) {
                // Stop any current playback
                stopSpeakingElevenLabs();

                // Create audio element and play
                const audioBlob = base64ToBlob(data.audio_base64, data.content_type || 'audio/mpeg');
                const audioUrl = URL.createObjectURL(audioBlob);
                currentAudio = new Audio(audioUrl);

                isSpeaking = true;
                currentSpeakingMsgId = msgId;
                updateSpeakButton(msgId, true);

                currentAudio.onended = () => {
                    console.log("ElevenLabs audio ended");
                    isSpeaking = false;
                    currentSpeakingMsgId = null;
                    updateSpeakButton(msgId, false);
                    URL.revokeObjectURL(audioUrl);

                    // Auto-listen trigger
                    if (voiceModeActive && !isRecording) {
                        console.log("Auto-listen: Starting mic after ElevenLabs TTS");
                        startListening();
                    }
                };

                currentAudio.onerror = (e) => {
                    console.error('Audio playback error:', e);
                    isSpeaking = false;
                    currentSpeakingMsgId = null;
                    updateSpeakButton(msgId, false);
                    // Try browser TTS as last resort
                    speakText(text, msgId);
                };

                await currentAudio.play();
                console.log('Playing audio from', data.provider);
            } else {
                console.warn('TTS returned no audio, using browser TTS');
                speakText(text, msgId);
            }
        } catch (err) {
            console.error('ElevenLabs TTS error:', err);
            speakText(text, msgId); // Fallback
        }
    }

    function stopSpeakingElevenLabs() {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            currentAudio = null;
        }
        stopSpeaking(); // Also stop browser TTS
    }

    function base64ToBlob(base64, mimeType) {
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: mimeType });
    }

    // Auto-resize textarea
    userInput.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });

    // Send on Enter (Shift+Enter for newline)
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    sendBtn.addEventListener('click', sendMessage);

    // New Chat Button
    if (newChatBtn) {
        newChatBtn.addEventListener('click', () => {
            startNewChat();
        });
    }

    const clearChatOld = document.getElementById('clear-chat');
    if (clearChatOld) {
        clearChatOld.addEventListener('click', startNewChat);
    }

    function startNewChat() {
        currentSessionId = null;
        localStorage.removeItem('chatbot_session_id');
        stopSpeaking(); // Stop any ongoing speech

        chatMessages.innerHTML = `
            <div class="message assistant-message first">
                <div class="message-content">
                    <strong>👋 Welcome to Miami Loves Green Landscaping!</strong><br><br>
                    We help homeowners transform their outdoor spaces with <strong>expert landscaping services</strong> — custom design, garden maintenance, hardscaping, and eco-friendly solutions.<br><br>
                    I can help you:<br>
                    • Learn about our landscaping services<br>
                    • Get a free quote for your project<br>
                    • Answer questions about plants and garden care<br>
                    • Schedule a consultation<br><br>
                    <em>How can I assist you with your landscape today?</em>
                </div>
            </div>
        `;

        document.querySelectorAll('.history-item').forEach(el => el.classList.remove('active'));
        loadSessions();
    }

    let messageIdCounter = 0;

    async function sendMessage() {
        const text = userInput.value.trim();
        if (!text || sendBtn.disabled) return;

        if (text.toLowerCase() === '/debug') {
            debugMode = !debugMode;
            addErrorMessage(`Debug Mode: ${debugMode ? 'ON' : 'OFF'}`);
            userInput.value = '';
            return;
        }

        addUserMessage(text);
        userInput.value = '';
        userInput.style.height = 'auto';

        sendBtn.disabled = true;
        userInput.disabled = true;
        sendBtn.style.opacity = '0.5';

        const indicator = showTypingIndicator();

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    session_id: currentSessionId
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: "Network error or server failed to return JSON." }));
                indicator.remove();
                addErrorMessage(errorData.detail || "Failed to connect to backend.");
                sendBtn.disabled = false;
                userInput.disabled = false;
                sendBtn.style.opacity = '1';
                return;
            }

            const data = await response.json();
            indicator.remove();

            sendBtn.disabled = false;
            userInput.disabled = false;
            sendBtn.style.opacity = '1';

            if (data.response) {
                const botText = typeof data.response === 'string' ? data.response : (data.response.response || JSON.stringify(data.response));
                const msgId = addBotMessage(botText, data);

                // Auto-speak if enabled (use ElevenLabs if voice mode active)
                console.log('Auto-speak check:', { autoSpeak, msgId, voiceModeActive, elevenLabsAvailable });
                if (autoSpeak && msgId) {
                    console.log('Triggering voice for message:', msgId);
                    if (voiceModeActive) {
                        speakWithElevenLabs(botText, msgId);
                    } else {
                        speakText(botText, msgId);
                    }
                }

                if (data.session_id) {
                    currentSessionId = data.session_id;
                    localStorage.setItem('chatbot_session_id', data.session_id);
                }

                // Update sidebar title if a new one was generated
                if (data.session_title) {
                    console.log("New session title:", data.session_title);
                    loadSessions(); // Refresh sidebar
                }
            } else if (data.detail) {
                addErrorMessage("Error: " + data.detail);
            } else {
                addErrorMessage("Received empty response from server.");
            }
        } catch (error) {
            if (indicator) indicator.remove();
            console.error("Fetch error:", error);
            addErrorMessage("Backend connection failed or timed out.");

            sendBtn.disabled = false;
            userInput.disabled = false;
            sendBtn.style.opacity = '1';
        }
    }

    async function loadSessions() {
        try {
            const res = await fetch('/api/sessions');
            const data = await res.json();

            historyList.innerHTML = '';

            if (data.sessions && data.sessions.length > 0) {
                data.sessions.forEach(session => {
                    const item = document.createElement('div');
                    item.className = 'history-item';
                    if (session.id === currentSessionId) item.classList.add('active');

                    item.innerHTML = `<span class="history-title">${escapeHTML(session.title)}</span>`;
                    item.addEventListener('click', () => loadSession(session.id));

                    historyList.appendChild(item);
                });
            } else {
                historyList.innerHTML = '<div class="sidebar-info">No history yet</div>';
            }
        } catch (e) {
            console.error("Load sessions error:", e);
        }
    }

    async function loadSession(sessionId, force = false) {
        if (!force && currentSessionId === sessionId) return;

        stopSpeaking(); // Stop any ongoing speech

        try {
            const res = await fetch(`/api/chat/${sessionId}`);
            const data = await res.json();

            currentSessionId = sessionId;
            chatMessages.innerHTML = '';

            if (data.history) {
                data.history.forEach(msg => {
                    if (msg.role === 'user') addUserMessage(msg.content);
                    else if (msg.role === 'assistant') {
                        if (msg.content) addBotMessage(msg.content);
                    }
                });
            }
            scrollToBottom();

            document.querySelectorAll('.history-item').forEach(el => el.classList.remove('active'));
            loadSessions();

        } catch (e) {
            console.error("Load session error:", e);
        }
    }

    function addUserMessage(text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message user-message';
        msgDiv.innerHTML = `<div class="message-content">${escapeHTML(text)}</div>`;
        chatMessages.appendChild(msgDiv);
        scrollToBottom();
    }

    function addBotMessage(text, fullData = null) {
        const msgId = `msg-${++messageIdCounter}`;
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message assistant-message';
        msgDiv.setAttribute('data-msg-id', msgId);

        // Message header with speak button
        const headerHtml = `
            <div class="message-header">
                <button class="speak-btn" title="Read aloud">${getSpeakerIcon()}</button>
            </div>
        `;

        let contentHtml = `<div class="message-content">${marked.parse(text)}</div>`;

        // Explicit Image Rendering
        if (fullData && (fullData.image_base64 || fullData.image_url)) {
            let imgHtml = '<div class="generated-image-container">';

            if (fullData.image_base64) {
                const mime = fullData.mime_type || 'image/png';
                imgHtml += `<img src="data:${mime};base64,${fullData.image_base64}" class="chat-image" alt="Generated Image">`;
            } else if (fullData.image_url) {
                imgHtml += `<img src="${fullData.image_url}" class="chat-image" alt="Generated Image">`;
                imgHtml += `<a href="${fullData.image_url}" target="_blank" class="fallback-link">🔗 Open Image in New Tab</a>`;
            }

            imgHtml += '</div>';

            if (!contentHtml.includes('<img')) {
                contentHtml += imgHtml;
            }
        }

        if (debugMode && fullData) {
            contentHtml += `<pre class="debug-json">${escapeHTML(JSON.stringify(fullData, null, 2))}</pre>`;
        }

        msgDiv.innerHTML = headerHtml + contentHtml;
        chatMessages.appendChild(msgDiv);

        // Add speak button click handler
        const speakBtn = msgDiv.querySelector('.speak-btn');
        if (speakBtn) {
            speakBtn.addEventListener('click', () => {
                if (isSpeaking && currentSpeakingMsgId === msgId) {
                    stopSpeaking();
                } else {
                    speakText(text, msgId);
                }
            });
        }

        // Post-process images
        msgDiv.querySelectorAll('img').forEach(img => {
            if (!img.classList.contains('chat-image')) {
                img.classList.add('chat-image');
            }
            img.onerror = function () {
                console.error("Image failed to load:", this.src);
                const fallback = document.createElement('div');
                fallback.className = 'image-error-fallback';
                fallback.innerHTML = `<p>⚠️ Image failed to load</p>`;
                this.replaceWith(fallback);
            };
        });

        scrollToBottom();
        return msgId;
    }

    function addErrorMessage(text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message assistant-message error-message';
        msgDiv.style.borderLeft = '4px solid var(--error)';
        msgDiv.innerHTML = `<div class="message-content">${text}</div>`;
        chatMessages.appendChild(msgDiv);
        scrollToBottom();
    }

    function showTypingIndicator() {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message assistant-message typing-indicator-container';
        msgDiv.innerHTML = `
            <div class="typing-indicator">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
            </div>
        `;
        chatMessages.appendChild(msgDiv);
        scrollToBottom();
        return msgDiv;
    }

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function escapeHTML(str) {
        if (!str) return '';
        return str.replace(/[&<>"']/g, function (m) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[m];
        });
    }

    // Init
    async function init() {
        if (currentSessionId) {
            loadSession(currentSessionId, true); // Force load the specific ID from storage
        } else {
            loadSessions();
        }

        if (statusText) statusText.textContent = 'Connecting...';

        try {
            const res = await fetch('/api/health');
            const data = await res.json();

            if (data.status === 'ready') {
                if (statusText) statusText.textContent = 'Online';
                if (statusDot) statusDot.style.background = 'var(--success)';
            } else if (data.status === 'warming_up') {
                if (statusText) statusText.textContent = 'Warming up...';
                if (statusDot) statusDot.style.background = 'var(--warning)';
                setTimeout(init, 5000);
            }
        } catch (error) {
            console.error("Health check failed:", error);
            if (statusText) statusText.textContent = 'Offline';
            if (statusDot) statusDot.style.background = 'var(--error)';
        }
    }

    init();
});
