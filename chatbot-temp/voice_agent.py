"""
Voice Agent Module for Pinnacle AI Solutions
TTS: ElevenLabs (primary) with Google TTS fallback
Designed for Render deployment with environment variables
"""

import os
import logging
import base64
from typing import Dict, Any
import httpx

logger = logging.getLogger(__name__)


class VoiceAgent:
    """Text-to-Speech agent with ElevenLabs primary and Google fallback."""

    # ElevenLabs voice IDs (free tier compatible)
    VOICES = {
        "rachel": "21m00Tcm4TlvDq8ikWAM",  # Warm, professional female
        "josh": "TxGEqnHWrfWFTfGW9XjX",  # Friendly male
        "bella": "EXAVITQu4vr4xnSDxMaL",  # Young female
        "adam": "pNInz6obpgDQGcFmaJgB",  # Deep male
    }
    DEFAULT_VOICE = "josh"

    def __init__(self):
        """Initialize voice agent with API keys from environment."""
        # Load API keys from Render environment
        self.elevenlabs_api_key = os.getenv("ELEVENLABS_API_KEY")
        # Reuse existing Google key if specific TTS key isn't provided
        self.google_tts_api_key = os.getenv("GOOGLE_TTS_API_KEY") or os.getenv(
            "GEMINI_API_KEY"
        )

        # Log initialization status
        if self.elevenlabs_api_key:
            logger.info("✅ ElevenLabs API key loaded")

        if self.google_tts_api_key:
            logger.info("✅ Google TTS/Gemini key loaded (fallback ready)")
        else:
            logger.warning("⚠️ No Google/ElevenLabs keys found for server-side TTS")

    @property
    def is_available(self) -> bool:
        """Check if any TTS service is available."""
        return bool(self.elevenlabs_api_key or self.google_tts_api_key)

    def get_status(self) -> Dict[str, Any]:
        """Return TTS service status."""
        return {
            "elevenlabs_enabled": bool(self.elevenlabs_api_key),
            "google_tts_enabled": bool(self.google_tts_api_key),
            "available": self.is_available,
            "default_voice": self.DEFAULT_VOICE,
        }

    async def text_to_speech(
        self, text: str, voice: str = "josh", return_base64: bool = True
    ) -> Dict[str, Any]:
        """
        Convert text to speech audio.

        Args:
            text: Text to convert to speech
            voice: Voice ID or name (rachel, josh, bella, adam)
            return_base64: If True, return base64 encoded audio

        Returns:
            Dict with success status and audio data or error
        """
        if not text or not text.strip():
            return {"success": False, "error": "No text provided"}

        # Clean text for voice (remove markdown, limit length)
        clean_text = self._clean_text_for_voice(text)

        if len(clean_text) > 5000:
            clean_text = clean_text[:5000] + "..."
            logger.warning("Text truncated to 5000 chars for TTS")

        # Try ElevenLabs first
        elevenlabs_error = None
        if self.elevenlabs_api_key:
            result = await self._elevenlabs_tts(clean_text, voice, return_base64)
            if result.get("success"):
                return result
            elevenlabs_error = result.get("error", "Unknown ElevenLabs error")
            logger.warning(f"ElevenLabs failed: {elevenlabs_error}. Trying Google...")

        # Fallback to Google TTS
        if self.google_tts_api_key:
            return await self._google_tts(clean_text, return_base64)

        # Return actual error from ElevenLabs if available
        if elevenlabs_error:
            return {"success": False, "error": f"ElevenLabs failed: {elevenlabs_error}"}

        return {"success": False, "error": "No TTS API keys configured"}

    def _clean_text_for_voice(self, text: str) -> str:
        """Remove markdown and format text for natural speech."""
        import re

        # Remove markdown formatting
        text = re.sub(r"\*\*([^*]+)\*\*", r"\1", text)  # Bold
        text = re.sub(r"\*([^*]+)\*", r"\1", text)  # Italic
        text = re.sub(r"`([^`]+)`", r"\1", text)  # Code
        text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)  # Links
        text = re.sub(r"^#+\s*", "", text, flags=re.MULTILINE)  # Headers
        text = re.sub(r"^[-*]\s*", "", text, flags=re.MULTILINE)  # Bullets
        text = re.sub(r"\n{2,}", ". ", text)  # Multiple newlines
        text = re.sub(r"\n", " ", text)  # Single newlines

        return text.strip()

    async def _elevenlabs_tts(
        self, text: str, voice: str, return_base64: bool
    ) -> Dict[str, Any]:
        """Generate speech using ElevenLabs API."""
        voice_id = self.VOICES.get(voice.lower(), self.VOICES[self.DEFAULT_VOICE])

        url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
        headers = {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": self.elevenlabs_api_key,
        }
        payload = {
            "text": text,
            "model_id": "eleven_multilingual_v2",
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.75,
            },
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(url, json=payload, headers=headers)

                if response.status_code == 200:
                    audio_data = response.content
                    if return_base64:
                        audio_b64 = base64.b64encode(audio_data).decode("utf-8")
                        return {
                            "success": True,
                            "audio_base64": audio_b64,
                            "content_type": "audio/mpeg",
                            "provider": "elevenlabs",
                            "voice": voice,
                        }
                    return {
                        "success": True,
                        "audio_bytes": audio_data,
                        "content_type": "audio/mpeg",
                        "provider": "elevenlabs",
                    }
                else:
                    error_text = response.text[:200]
                    logger.error(
                        f"ElevenLabs error {response.status_code}: {error_text}"
                    )
                    return {
                        "success": False,
                        "error": f"ElevenLabs error {response.status_code}: {error_text}",
                    }

        except Exception as e:
            logger.error(f"ElevenLabs request failed: {e}")
            return {"success": False, "error": str(e)}

    async def _google_tts(self, text: str, return_base64: bool) -> Dict[str, Any]:
        """Generate speech using Google Cloud TTS API (fallback)."""
        url = f"https://texttospeech.googleapis.com/v1/text:synthesize?key={self.google_tts_api_key}"

        payload = {
            "input": {"text": text},
            "voice": {
                "languageCode": "en-US",
                "name": "en-US-Neural2-D",  # Premium male voice (matches Josh persona)
                "ssmlGender": "MALE",
            },
            "audioConfig": {
                "audioEncoding": "MP3",
                "speakingRate": 1.0,
                "pitch": 0.0,
            },
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(url, json=payload)

                if response.status_code == 200:
                    data = response.json()
                    audio_b64 = data.get("audioContent", "")

                    if return_base64:
                        return {
                            "success": True,
                            "audio_base64": audio_b64,
                            "content_type": "audio/mpeg",
                            "provider": "google",
                        }
                    else:
                        audio_bytes = base64.b64decode(audio_b64)
                        return {
                            "success": True,
                            "audio_bytes": audio_bytes,
                            "content_type": "audio/mpeg",
                            "provider": "google",
                        }
                else:
                    error_text = response.text[:200]
                    logger.error(
                        f"Google TTS error {response.status_code}: {error_text}"
                    )
                    return {
                        "success": False,
                        "error": f"Google TTS API error: {response.status_code}",
                    }

        except Exception as e:
            logger.error(f"Google TTS request failed: {e}")
            return {"success": False, "error": str(e)}


# Voice-optimized system prompt for Pinnacle AI (NO PRICING - services only)
VOICE_SYSTEM_PROMPT = """You are the AI Voice Assistant for Pinnacle AI Solutions, a North Florida-based company specializing in custom AI automation for businesses.

VOICE INTERACTION RULES:
- Keep responses SHORT and conversational (2-4 sentences ideal)
- Speak naturally like a helpful phone agent
- Avoid long lists - summarize instead
- No markdown formatting (**, [], etc.) - plain text only
- Use contractions (we're, you'll, that's)

CORE SERVICES:
1. AI Chatbots - 24/7 customer service bots
2. Lead Generation - automated prospect finding
3. Workflow Automation - save 20+ hours/week
4. Voice Agents - like me!
5. Custom AI Solutions

CONTACT: 352-231-9154 | futureai4all@gmail.com

For quotes: Get name, email, phone, and project details, then confirm 24hr callback.

Be warm, helpful, and conversational. No bullet points or lists in spoken responses."""
