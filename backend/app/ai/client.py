import os
import json
import re
import time
import logging
from typing import Optional, Dict, Any, Type, TypeVar, Callable
from pydantic import BaseModel, ValidationError

try:
    import google.generativeai as genai
except ImportError:
    genai = None

from app.ai.config import ai_config

logger = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)

class GeminiAIClient:
    """
    Centralized client for all Google Gemini API interactions in EduGuard.
    Manages model routing, safe JSON structured output extraction, retry/repair,
    and mock test hooks.
    """
    def __init__(self):
        self._api_key = ai_config.GEMINI_API_KEY
        self._is_configured = False
        self._mock_handler: Optional[Callable[[str, str], str]] = None
        self._init_sdk()

    def _init_sdk(self):
        if genai and self._api_key:
            try:
                genai.configure(api_key=self._api_key)
                self._is_configured = True
            except Exception as e:
                logger.warning(f"Failed to configure google.generativeai SDK: {e}")
                self._is_configured = False
        else:
            self._is_configured = False

    def set_mock_handler(self, handler: Optional[Callable[[str, str], str]]):
        """Allows test suites to inject deterministic mock responses."""
        self._mock_handler = handler

    @property
    def is_available(self) -> bool:
        return self._is_configured or (self._mock_handler is not None)

    def route_model(self, task_type: str) -> str:
        return ai_config.get_model_for_task(task_type)

    def clean_json_string(self, text: str) -> str:
        """Strips markdown code fences and cleans leading/trailing whitespace."""
        text = text.strip()
        # Handle ```json ... ``` or ``` ... ```
        fence_match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
        if fence_match:
            return fence_match.group(1).strip()
        return text

    def safe_repair_json(self, json_str: str) -> Optional[Dict[str, Any]]:
        """Attempts safe repair of common minor JSON syntax anomalies."""
        try:
            return json.loads(json_str)
        except json.JSONDecodeError:
            pass

        # Try removing trailing commas before } or ]
        repaired = re.sub(r",\s*([\]}])", r"\1", json_str)
        try:
            return json.loads(repaired)
        except json.JSONDecodeError:
            pass

        # Try finding the first { and last }
        start = json_str.find("{")
        end = json_str.rfind("}")
        if start != -1 and end != -1 and end > start:
            substring = json_str[start:end + 1]
            try:
                return json.loads(substring)
            except json.JSONDecodeError:
                pass

        return None

    def generate_text(
        self,
        prompt: str,
        task_type: str = "simple_explanation",
        model_override: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Sends request to configured Gemini model or test mock.
        Returns dict with text, model_used, latency_ms, success, error.
        """
        model_name = model_override or self.route_model(task_type)
        start_time = time.time()

        # Check if test mock handler is set
        if self._mock_handler is not None:
            try:
                mock_res = self._mock_handler(prompt, model_name)
                latency = int((time.time() - start_time) * 1000)
                return {
                    "text": mock_res,
                    "model_used": model_name,
                    "latency_ms": max(5, latency),
                    "success": True,
                    "error": None
                }
            except Exception as e:
                return {
                    "text": "",
                    "model_used": model_name,
                    "latency_ms": int((time.time() - start_time) * 1000),
                    "success": False,
                    "error": str(e)
                }

        # Real Gemini API call
        if not self._is_configured:
            return {
                "text": "",
                "model_used": model_name,
                "latency_ms": int((time.time() - start_time) * 1000),
                "success": False,
                "error": "Gemini API key is not configured or SDK unavailable."
            }

        try:
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(prompt)
            latency = int((time.time() - start_time) * 1000)
            return {
                "text": response.text,
                "model_used": model_name,
                "latency_ms": latency,
                "success": True,
                "error": None
            }
        except Exception as e:
            logger.error(f"Gemini API request failed for model {model_name}: {e}")
            return {
                "text": "",
                "model_used": model_name,
                "latency_ms": int((time.time() - start_time) * 1000),
                "success": False,
                "error": str(e)
            }

    def generate_structured(
        self,
        prompt: str,
        task_type: str,
        schema_class: Type[T],
        model_override: Optional[str] = None
    ) -> Optional[T]:
        """
        Executes Gemini call, cleans and repairs JSON, and validates with Pydantic.
        Returns parsed schema instance, or None if validation fails.
        """
        res = self.generate_text(prompt, task_type=task_type, model_override=model_override)
        if not res["success"] or not res["text"]:
            return None

        cleaned = self.clean_json_string(res["text"])
        data = self.safe_repair_json(cleaned)
        if data is None:
            logger.warning(f"Could not parse valid JSON from AI response: {cleaned[:100]}...")
            return None

        try:
            instance = schema_class.model_validate(data)
            return instance
        except ValidationError as e:
            logger.warning(f"Schema validation failed for {schema_class.__name__}: {e}")
            return None

gemini_client = GeminiAIClient()
