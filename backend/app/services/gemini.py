import json
import google.generativeai as genai
from app.config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)

# The prompt tells Gemini exactly what JSON shape to return.
# Keeping it strict (response_mime_type="application/json") means you can
# call json.loads() directly on response.text without extra parsing.
ANALYSIS_PROMPT = """
You are an expert climbing coach analyzing a climbing video. Analyze the climber's technique and provide structured feedback.

Return a JSON object with exactly these fields:
{
  "movement_summary": "<2-3 sentence summary of overall movement quality>",
  "footwork_score": <1-10 integer>,
  "body_position_score": <1-10 integer>,
  "balance_score": <1-10 integer>,
  "technique_tags": ["<tag1>", "<tag2>", ...],
  "key_moments": [
    {"timestamp_seconds": <number>, "description": "<what happens at this moment>"},
    ...
  ]
}

technique_tags examples: "heel hook", "flag", "drop knee", "hip turn", "smear", "crimp grip", "open hand", "barn door"
Focus on movement efficiency, weight transfer, footwork precision, and body positioning.
"""


async def analyze_video(video_bytes: bytes, mime_type: str = "video/mp4") -> dict:
    """Send video bytes to Gemini and return the parsed JSON response.

    CHALLENGE:
    - Create a GenerativeModel using "gemini-1.5-pro"
    - Call generate_content_async() with two parts: the video bytes (as an
      inline dict with "mime_type" and "data" keys) and the ANALYSIS_PROMPT string
    - Use GenerationConfig with response_mime_type="application/json" and a low temperature
    - Parse response.text with json.loads() and return the dict
    """
    raise NotImplementedError


async def generate_embedding(text: str) -> list[float]:
    """Convert a text string into a vector of floats using Gemini's embedding model.

    CHALLENGE:
    - Call genai.embed_content_async() with model="models/text-embedding-004"
      and your text as the content argument
    - The result is a dict — the embedding lives at result["embedding"]
    - Return it as a list[float]

    This is what gets stored in pgvector. The text you pass in will be the
    JSON-stringified Gemini analysis, so semantically similar climbs will
    end up with similar vectors.
    """
    raise NotImplementedError
